import { afterEach, describe, expect, it, vi } from 'vitest';

const importApiModule = async () => {
  vi.resetModules();
  return import('../api');
};

const jsonResponse = (body: unknown, init?: ResponseInit) => {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  localStorage.clear();
});

describe('api service integration client', () => {
  it('creates a new account, stores JWT, and returns the signed-up user', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');

    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({
      token: 'jwt-token-123',
      user: {
        id: '2',
        email: 'new@example.com',
        name: 'New User',
        companyName: 'New Co',
        plan: 'starter',
        createdAt: '2026-04-21T00:00:00.000Z',
      },
    }, { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const { api } = await importApiModule();
    const user = await api.auth.signup({
      email: 'new@example.com',
      password: 'StrongPass123!',
      name: 'New User',
      companyName: 'New Co',
      plan: 'starter',
    });

    expect(user.email).toBe('new@example.com');
    expect(localStorage.getItem('saas.auth.token')).toBe('jwt-token-123');

    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;
    expect(requestOptions.method).toBe('POST');
    expect(requestOptions.body).toBe(JSON.stringify({
      email: 'new@example.com',
      password: 'StrongPass123!',
      name: 'New User',
      companyName: 'New Co',
      plan: 'starter',
    }));
  });

  it('returns clear duplicate-email error messages for signup', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');

    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(
      { message: 'Email already in use.', code: 'EMAIL_ALREADY_EXISTS' },
      { status: 409 },
    ));
    vi.stubGlobal('fetch', fetchMock);

    const { api } = await importApiModule();
    await expect(api.auth.signup({
      email: 'duplicate@example.com',
      password: 'StrongPass123!',
      name: 'Duplicate User',
      companyName: 'Duplicate Co',
      plan: 'starter',
    })).rejects.toThrow('Email already in use.');
  });

  it('normalizes password validation errors from signup endpoint', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');

    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(
      {
        message: [
          'Password must be at least 8 characters long.',
          'Password must contain at least one special character.',
        ],
        error: 'Validation failed.',
      },
      { status: 400 },
    ));
    vi.stubGlobal('fetch', fetchMock);

    const { api } = await importApiModule();
    await expect(api.auth.signup({
      email: 'invalid@example.com',
      password: 'weakpass',
      name: 'Invalid User',
      companyName: 'Invalid Co',
      plan: 'starter',
    })).rejects.toThrow(
      'Password must be at least 8 characters long., Password must contain at least one special character.',
    );
  });

  it('uses configured API base URL and auth token header', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com/v1');
    localStorage.setItem('saas.auth.token', 'token-123');

    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({
      id: '1',
      email: 'owner@example.com',
      name: 'Owner',
      companyName: 'Acme',
      plan: 'professional',
      createdAt: '2026-01-01',
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { api } = await importApiModule();
    await api.auth.getCurrentUser();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/auth/me',
      expect.objectContaining({
        credentials: 'include',
        method: 'GET',
      }),
    );

    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = requestOptions.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token-123');
    expect(headers.Accept).toBe('application/json');
  });

  it('falls back to local development API URL when env var is empty', async () => {
    vi.stubEnv('VITE_API_URL', '');

    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse([]));
    vi.stubGlobal('fetch', fetchMock);

    const { api } = await importApiModule();
    await api.conversations.getAll();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3100/api/conversations',
      expect.any(Object),
    );
  });

  it('normalizes API errors from JSON payloads', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');

    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(
      { message: 'Database unavailable' },
      { status: 503 },
    ));
    vi.stubGlobal('fetch', fetchMock);

    const { api } = await importApiModule();

    await expect(api.analytics.getStats()).rejects.toThrow('Database unavailable');
  });

  it('sends JSON payloads for write endpoints', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');

    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({
      id: 9,
      conversationId: 1,
      sender: 'agent',
      text: 'Hello',
      timestamp: '2026-04-20T10:00:00.000Z',
      aiGenerated: false,
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { api } = await importApiModule();
    await api.conversations.sendMessage(1, 'Hello', false);

    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;
    expect(requestOptions.method).toBe('POST');
    expect(requestOptions.body).toBe(JSON.stringify({ text: 'Hello', useAI: false }));
  });

  it('downloads CSV using blob response', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');

    const fetchMock = vi.fn().mockResolvedValueOnce(new Response('name,email', {
      status: 200,
      headers: { 'Content-Type': 'text/csv' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { api } = await importApiModule();
    const blob = await api.leads.exportCSV();

    expect(blob).toBeDefined();
    expect(blob.type).toBe('text/csv');
    expect(blob.size).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/leads/export',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});
