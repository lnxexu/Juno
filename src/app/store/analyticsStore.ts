import { create } from 'zustand';
import { api, AnalyticsData } from '../services/api';

interface AnalyticsState {
  stats: {
    totalConversations: number;
    leadsCaptured: number;
    responseRate: number;
    conversionRate: number;
  };
  chartData: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStats: () => Promise<void>;
  fetchChartData: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  stats: {
    totalConversations: 0,
    leadsCaptured: 0,
    responseRate: 0,
    conversionRate: 0,
  },
  chartData: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await api.analytics.getStats();
      set({ stats, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchChartData: async () => {
    set({ isLoading: true, error: null });
    try {
      const chartData = await api.analytics.getChartData();
      set({ chartData, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [stats, chartData] = await Promise.all([
        api.analytics.getStats(),
        api.analytics.getChartData(),
      ]);
      set({ stats, chartData, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
