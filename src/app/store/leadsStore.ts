import { create } from 'zustand';
import { api, Lead } from '../services/api';

interface LeadsState {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  filterStatus: 'all' | Lead['status'];

  // Actions
  fetchLeads: () => Promise<void>;
  updateLeadStatus: (id: number, status: Lead['status']) => Promise<void>;
  exportLeads: () => Promise<void>;
  setFilterStatus: (status: 'all' | Lead['status']) => void;

  // Computed
  filteredLeads: () => Lead[];
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: [],
  isLoading: false,
  error: null,
  filterStatus: 'all',

  fetchLeads: async () => {
    set({ isLoading: true, error: null });
    try {
      const leads = await api.leads.getAll();
      set({ leads, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateLeadStatus: async (id, status) => {
    try {
      const updatedLead = await api.leads.updateStatus(id, status);
      const leads = get().leads.map(l => l.id === id ? updatedLead : l);
      set({ leads });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  exportLeads: async () => {
    try {
      const blob = await api.leads.exportCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  setFilterStatus: (status) => {
    set({ filterStatus: status });
  },

  filteredLeads: () => {
    const { leads, filterStatus } = get();
    return filterStatus === 'all'
      ? leads
      : leads.filter(l => l.status === filterStatus);
  },
}));
