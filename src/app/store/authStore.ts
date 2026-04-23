import { create } from 'zustand';
import { api, clearStoredAuthToken, type LoginPayload, type SignupPayload, User } from '../services/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  signup: (data: SignupPayload) => Promise<void>;
  login: (data: LoginPayload) => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.auth.signup(data);
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.auth.login(data);
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.auth.getCurrentUser();
      set({ user, isLoading: false });
    } catch (error) {
      set({ user: null, error: (error as Error).message, isLoading: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.auth.updateProfile(data);
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  logout: () => {
    clearStoredAuthToken();
    set({ user: null });
  },
}));
