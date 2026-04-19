import { create } from 'zustand';
import { api, KnowledgeBaseItem } from '../services/api';

interface AITrainingState {
  knowledgeBase: KnowledgeBaseItem[];
  isLoading: boolean;
  isTraining: boolean;
  isTesting: boolean;
  error: string | null;
  testResult: { answer: string; confidence: number } | null;

  // Actions
  fetchKnowledgeBase: () => Promise<void>;
  addKnowledgeItem: (item: Omit<KnowledgeBaseItem, 'id' | 'embedding'>) => Promise<void>;
  updateKnowledgeItem: (id: number, data: Partial<KnowledgeBaseItem>) => Promise<void>;
  deleteKnowledgeItem: (id: number) => Promise<void>;
  trainModel: () => Promise<void>;
  testAI: (question: string) => Promise<void>;
  clearTestResult: () => void;
}

export const useAITrainingStore = create<AITrainingState>((set, get) => ({
  knowledgeBase: [],
  isLoading: false,
  isTraining: false,
  isTesting: false,
  error: null,
  testResult: null,

  fetchKnowledgeBase: async () => {
    set({ isLoading: true, error: null });
    try {
      const knowledgeBase = await api.aiTraining.getKnowledgeBase();
      set({ knowledgeBase, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addKnowledgeItem: async (item) => {
    set({ isLoading: true, error: null });
    try {
      const newItem = await api.aiTraining.addKnowledgeItem(item);
      set({
        knowledgeBase: [...get().knowledgeBase, newItem],
        isLoading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateKnowledgeItem: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await api.aiTraining.updateKnowledgeItem(id, data);
      const knowledgeBase = get().knowledgeBase.map(k =>
        k.id === id ? updated : k
      );
      set({ knowledgeBase, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteKnowledgeItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.aiTraining.deleteKnowledgeItem(id);
      const knowledgeBase = get().knowledgeBase.filter(k => k.id !== id);
      set({ knowledgeBase, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  trainModel: async () => {
    set({ isTraining: true, error: null });
    try {
      await api.aiTraining.trainModel();
      set({ isTraining: false });
    } catch (error) {
      set({ error: (error as Error).message, isTraining: false });
    }
  },

  testAI: async (question) => {
    set({ isTesting: true, error: null, testResult: null });
    try {
      const result = await api.aiTraining.testAI(question);
      set({ testResult: result, isTesting: false });
    } catch (error) {
      set({ error: (error as Error).message, isTesting: false });
    }
  },

  clearTestResult: () => {
    set({ testResult: null });
  },
}));
