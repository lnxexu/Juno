import { create } from 'zustand';
import { api, Conversation, Message } from '../services/api';

type MessageDeliveryStatus = 'pending' | 'sent' | 'failed';

export interface ConversationMessage extends Message {
  deliveryStatus?: MessageDeliveryStatus;
  originalText?: string;
  error?: string;
}

const SEND_MESSAGE_ERROR_PREFIX = 'Failed to send message.';
const OFFLINE_SEND_MESSAGE = 'You are offline. Please check your internet connection and try again.';
let nextOptimisticMessageId = -1;
let sendMessageInFlight = false;

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

      set({ messages, isLoading: false });
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
      messages: [...state.messages, optimisticMessage],
    }));

    try {
      if (!isNetworkOnline()) {
        const errorMessage = `${SEND_MESSAGE_ERROR_PREFIX} ${OFFLINE_SEND_MESSAGE}`;

        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, deliveryStatus: 'failed' as const, error: errorMessage }
              : msg
          ),
          error: errorMessage,
        }));
        return false;
      }

      const message = await api.conversations.sendMessage(conversationId, trimmedText, aiEnabled);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...message, deliveryStatus: 'sent' as const }
            : msg
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
        messages: state.messages.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...msg, deliveryStatus: 'failed' as const, error: errorMessage }
            : msg
        ),
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
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, deliveryStatus: 'pending' as const, error: undefined }
          : msg
      ),
    }));

    if (!isNetworkOnline()) {
      const errorMessage = `${SEND_MESSAGE_ERROR_PREFIX} ${OFFLINE_SEND_MESSAGE}`;

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId
            ? { ...msg, deliveryStatus: 'failed' as const, error: errorMessage }
            : msg
        ),
        error: errorMessage,
        isSending: false,
      }));
      return false;
    }

    try {
      const message = await api.conversations.sendMessage(conversationId, messageText, useAI);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId
            ? { ...message, deliveryStatus: 'sent' as const }
            : msg
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
        messages: state.messages.map((msg) =>
          msg.id === messageId
            ? { ...msg, deliveryStatus: 'failed' as const, error: errorMessage }
            : msg
        ),
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
