import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api, type User } from '../../services/api';
import { useAuthStore } from '../authStore';

const mockUser: User = {
  id: '1',
  email: 'owner@example.com',
  name: 'Business Owner',
  companyName: 'Acme Co',
  plan: 'professional',
  createdAt: '2026-01-15',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState(useAuthStore.getInitialState(), true);
    vi.restoreAllMocks();
  });

  it('fetches current user successfully', async () => {
    vi.spyOn(api.auth, 'getCurrentUser').mockResolvedValueOnce(mockUser);

    await useAuthStore.getState().fetchUser();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('stores an error when fetchUser fails', async () => {
    vi.spyOn(api.auth, 'getCurrentUser').mockRejectedValueOnce(new Error('Unauthorized'));

    await useAuthStore.getState().fetchUser();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.error).toBe('Unauthorized');
    expect(state.isLoading).toBe(false);
  });

  it('clears the user on logout', () => {
    useAuthStore.setState({ user: mockUser });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
  });
});
