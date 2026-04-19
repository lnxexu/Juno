import { create } from 'zustand';
import { api, Conversation, Message } from '../services/api';

interface ConversationState {
  conversations: Conversation[];
  selectedConversationId: number | null;
  messages: Message[];
  aiEnabled: boolean;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  selectConversation: (id: number) => Promise<void>;
  sendMessage: (conversationId: number, text: string) => Promise<void>;
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
    const { aiEnabled } = get();
    set({ isSending: true, error: null });
    try {
      const message = await api.conversations.sendMessage(conversationId, text, aiEnabled);
      set((state) => ({
        messages: [...state.messages, message],
        conversations: state.conversations.map(c =>
          c.id === conversationId
            ? { ...c, lastMessage: text, timestamp: message.timestamp }
            : c
        ),
        isSending: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isSending: false });
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
