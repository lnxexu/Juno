import { create } from 'zustand';
import { api, Conversation, Message } from '../services/api';

type MessageDeliveryStatus = 'pending' | 'sent' | 'failed';

export interface ConversationMessage extends Message {
  deliveryStatus?: MessageDeliveryStatus;
  originalText?: string;
  error?: string;
  clientRequestId?: string;
}

const SEND_MESSAGE_ERROR_PREFIX = 'Failed to send message.';
const OFFLINE_SEND_MESSAGE = 'You are offline. Please check your internet connection and try again.';
let nextOptimisticMessageId = -1;
let nextClientRequestId = 1;
let sendMessageInFlight = false;

const buildClientRequestId = () => `temp-${nextClientRequestId++}`;

const parseTimestampToNumber = (timestamp: string) => {
  const parsedTimestamp = Date.parse(timestamp);
  return Number.isNaN(parsedTimestamp) ? 0 : parsedTimestamp;
};

export const getConversationMessageStableKey = (message: ConversationMessage) => (
  message.clientRequestId ?? `server-${message.id}`
);

export const sortConversationMessages = (messages: ConversationMessage[]) => (
  [...messages].sort((left, right) => {
    const timestampDifference = parseTimestampToNumber(left.timestamp) - parseTimestampToNumber(right.timestamp);
    if (timestampDifference !== 0) {
      return timestampDifference;
    }

    const stableKeyDifference = getConversationMessageStableKey(left)
      .localeCompare(getConversationMessageStableKey(right));
    if (stableKeyDifference !== 0) {
      return stableKeyDifference;
    }

    return left.id - right.id;
  })
);

const normalizeLoadedMessages = (messages: Message[]) => {
  const dedupedByServerId = new Map<number, ConversationMessage>();

  for (const message of messages) {
    dedupedByServerId.set(message.id, message);
  }

  return sortConversationMessages(Array.from(dedupedByServerId.values()));
};

export const replaceOptimisticMessageWithServerMessage = (
  messages: ConversationMessage[],
  optimisticMessageId: number,
  serverMessage: ConversationMessage,
) => {
  const filteredMessages = messages.filter((message) => {
    if (message.id === optimisticMessageId) {
      return false;
    }

    if (serverMessage.clientRequestId && message.clientRequestId === serverMessage.clientRequestId) {
      return false;
    }

    if (serverMessage.id > 0 && message.id > 0 && message.id === serverMessage.id) {
      return false;
    }

    return true;
  });

  return sortConversationMessages([...filteredMessages, serverMessage]);
};

const isNetworkOnline = () => {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine;
};

interface ConversationState {
  conversations: Conversation[];
  selectedConversationId: number | null;
  messages: ConversationMessage[];
  aiEnabled: boolean;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  selectConversation: (id: number) => Promise<void>;
  sendMessage: (conversationId: number, text: string) => Promise<boolean>;
  retryMessage: (conversationId: number, messageId: number) => Promise<boolean>;
  toggleAI: (enabled: boolean) => void;
  markAsRead: (conversationId: number) => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  selectedConversationId: null,
  messages: [],
  aiEnabled: true,
  isLoading: false,
  isSending: false,
  error: null,

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const conversations = await api.conversations.getAll();
      set({ conversations, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectConversation: async (id) => {
    set({ isLoading: true, error: null, selectedConversationId: id });
    try {
      const messages = await api.conversations.getMessages(id);
      if (get().selectedConversationId !== id) {
        return;
      }

      set({ messages: normalizeLoadedMessages(messages), isLoading: false });
      await api.conversations.markAsRead(id);

      if (get().selectedConversationId !== id) {
        return;
      }

      // Update unread status locally
      const conversations = get().conversations.map(c =>
        c.id === id ? { ...c, unread: false } : c
      );
      set({ conversations });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  sendMessage: async (conversationId, text) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return false;
    }

    if (sendMessageInFlight || get().isSending) {
      return false;
    }

    sendMessageInFlight = true;

    const { aiEnabled } = get();
    const optimisticMessage: ConversationMessage = {
      id: nextOptimisticMessageId--,
      clientRequestId: buildClientRequestId(),
      conversationId,
      sender: aiEnabled ? 'ai' : 'agent',
      text: aiEnabled ? `AI Response: ${trimmedText}` : trimmedText,
      timestamp: new Date().toISOString(),
      aiGenerated: aiEnabled,
      deliveryStatus: 'pending',
      originalText: trimmedText,
    };

    set((state) => ({
      isSending: true,
      error: null,
      messages: sortConversationMessages([...state.messages, optimisticMessage]),
    }));

    try {
      if (!isNetworkOnline()) {
        const errorMessage = `${SEND_MESSAGE_ERROR_PREFIX} ${OFFLINE_SEND_MESSAGE}`;

        set((state) => ({
          messages: sortConversationMessages(state.messages.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, deliveryStatus: 'failed' as const, error: errorMessage }
              : msg
          )),
          error: errorMessage,
        }));
        return false;
      }

      const message = await api.conversations.sendMessage(conversationId, trimmedText, aiEnabled);
      const resolvedMessage: ConversationMessage = {
        ...message,
        deliveryStatus: 'sent',
        clientRequestId: optimisticMessage.clientRequestId,
      };

      set((state) => ({
        messages: replaceOptimisticMessageWithServerMessage(
          state.messages,
          optimisticMessage.id,
          resolvedMessage,
        ),
        conversations: state.conversations.map(c =>
          c.id === conversationId
            ? { ...c, lastMessage: trimmedText, timestamp: message.timestamp }
            : c
        ),
      }));
      return true;
    } catch (error) {
      const apiError = (error as Error).message;
      const errorMessage = apiError
        ? `${SEND_MESSAGE_ERROR_PREFIX} ${apiError}`
        : SEND_MESSAGE_ERROR_PREFIX;

      set((state) => ({
        messages: sortConversationMessages(state.messages.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...msg, deliveryStatus: 'failed' as const, error: errorMessage }
            : msg
        )),
        error: errorMessage,
      }));
      return false;
    } finally {
      sendMessageInFlight = false;
      set({ isSending: false });
    }
  },

  retryMessage: async (conversationId, messageId) => {
    if (get().isSending) {
      return false;
    }

    const failedMessage = get().messages.find(
      (msg) => msg.id === messageId && msg.deliveryStatus === 'failed'
    );

    if (!failedMessage) {
      return false;
    }

    const messageText = failedMessage.originalText ?? failedMessage.text;

    const useAI = failedMessage.aiGenerated ?? get().aiEnabled;

    set((state) => ({
      isSending: true,
      error: null,
      messages: sortConversationMessages(state.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, deliveryStatus: 'pending' as const, error: undefined }
          : msg
      )),
    }));

    if (!isNetworkOnline()) {
      const errorMessage = `${SEND_MESSAGE_ERROR_PREFIX} ${OFFLINE_SEND_MESSAGE}`;

      set((state) => ({
        messages: sortConversationMessages(state.messages.map((msg) =>
          msg.id === messageId
            ? { ...msg, deliveryStatus: 'failed' as const, error: errorMessage }
            : msg
        )),
        error: errorMessage,
        isSending: false,
      }));
      return false;
    }

    try {
      const message = await api.conversations.sendMessage(conversationId, messageText, useAI);
      const resolvedMessage: ConversationMessage = {
        ...message,
        deliveryStatus: 'sent',
        clientRequestId: failedMessage.clientRequestId ?? buildClientRequestId(),
      };

      set((state) => ({
        messages: replaceOptimisticMessageWithServerMessage(
          state.messages,
          messageId,
          resolvedMessage,
        ),
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage: messageText, timestamp: message.timestamp }
            : c
        ),
        isSending: false,
      }));
      return true;
    } catch (error) {
      const apiError = (error as Error).message;
      const errorMessage = apiError
        ? `${SEND_MESSAGE_ERROR_PREFIX} ${apiError}`
        : SEND_MESSAGE_ERROR_PREFIX;

      set((state) => ({
        messages: sortConversationMessages(state.messages.map((msg) =>
          msg.id === messageId
            ? { ...msg, deliveryStatus: 'failed' as const, error: errorMessage }
            : msg
        )),
        error: errorMessage,
        isSending: false,
      }));
      return false;
    }
  },

  toggleAI: (enabled) => {
    set({ aiEnabled: enabled });
  },

  markAsRead: async (conversationId) => {
    try {
      await api.conversations.markAsRead(conversationId);
      const conversations = get().conversations.map(c =>
        c.id === conversationId ? { ...c, unread: false } : c
      );
      set({ conversations });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },
}));
