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

  it('creates an account with signup', async () => {
    vi.spyOn(api.auth, 'signup').mockResolvedValueOnce(mockUser);

    await useAuthStore.getState().signup({
      email: 'owner@example.com',
      password: 'SecurePass123!',
      name: 'Business Owner',
      companyName: 'Acme Co',
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('logs in with valid credentials', async () => {
    vi.spyOn(api.auth, 'login').mockResolvedValueOnce(mockUser);

    await useAuthStore.getState().login({
      email: 'owner@example.com',
      password: 'SecurePass123!',
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('stores an error when login fails', async () => {
    vi.spyOn(api.auth, 'login').mockRejectedValueOnce(new Error('Invalid email or password.'));

    await expect(useAuthStore.getState().login({
      email: 'owner@example.com',
      password: 'WrongPass123!',
    })).rejects.toThrow('Invalid email or password.');

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.error).toBe('Invalid email or password.');
    expect(state.isLoading).toBe(false);
  });

  it('stores an error when signup fails', async () => {
    vi.spyOn(api.auth, 'signup').mockRejectedValueOnce(new Error('Email already in use.'));

    await expect(useAuthStore.getState().signup({
      email: 'owner@example.com',
      password: 'SecurePass123!',
      name: 'Business Owner',
      companyName: 'Acme Co',
    })).rejects.toThrow('Email already in use.');

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.error).toBe('Email already in use.');
    expect(state.isLoading).toBe(false);
  });

  it('clears the user on logout', () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    useAuthStore.setState({ user: mockUser });

    useAuthStore.getState().logout();

    expect(removeItemSpy).toHaveBeenCalledWith('saas.auth.token');
    expect(useAuthStore.getState().user).toBeNull();
  });
});
