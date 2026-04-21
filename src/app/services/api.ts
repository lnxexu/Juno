export interface User {
  id: string;
  email: string;
  name: string;
  companyName: string;
  plan: 'starter' | 'professional' | 'enterprise';
  createdAt: string;
}

export interface Conversation {
  id: number;
  customerId: string;
  customerName: string;
  lastMessage: string;
  timestamp: string;
  source: 'facebook' | 'instagram' | 'web';
  unread: boolean;
  aiHandled: boolean;
}

export interface Message {
  id: number;
  conversationId: number;
  sender: 'customer' | 'ai' | 'agent';
  text: string;
  timestamp: string;
  aiGenerated?: boolean;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: 'facebook' | 'instagram' | 'web';
  status: 'new' | 'contacted' | 'converted';
  interest: string;
  date: string;
  value: string;
}

export interface KnowledgeBaseItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  embedding?: number[];
}

export interface AnalyticsData {
  messagesHandled: Array<{ date: string; messages: number; aiHandled: number }>;
  conversionRate: Array<{ month: string; rate: number }>;
  responseTime: Array<{ week: string; time: number }>;
  channelDistribution: Array<{ name: string; value: number; color: string }>;
}

interface ApiErrorPayload {
  message?: string | string[];
  error?: string;
  code?: string;
  details?: unknown;
}

const DEFAULT_API_BASE_URL = 'http://localhost:3100/api';
const DEFAULT_TIMEOUT_MS = 15000;

const normalizeApiBaseUrl = (rawUrl: string | undefined) => {
  const trimmed = rawUrl?.trim();
  return (trimmed && trimmed.length > 0 ? trimmed : DEFAULT_API_BASE_URL).replace(/\/+$/, '');
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
const API_TOKEN_STORAGE_KEY = import.meta.env.VITE_API_TOKEN_STORAGE_KEY ?? 'saas.auth.token';

const getStoredAuthToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(API_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const toErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return 'Unexpected request failure.';
};

const parseErrorPayload = async (response: Response): Promise<ApiErrorPayload | null> => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return (await response.json()) as ApiErrorPayload;
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text ? { message: text } : null;
  } catch {
    return null;
  }
};

class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

const buildHeaders = (customHeaders?: Record<string, string>) => {
  const token = getStoredAuthToken();

  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
};

const request = async <T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
  const abortController = new AbortController();
  const timeoutHandle = window.setTimeout(() => abortController.abort(), API_TIMEOUT_MS);

  try {
    const hasBody = options.body !== undefined;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method ?? 'GET',
      headers: {
        ...buildHeaders(options.headers),
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
      credentials: 'include',
      signal: options.signal ?? abortController.signal,
    });

    if (!response.ok) {
      const errorPayload = await parseErrorPayload(response);
      const payloadMessage = Array.isArray(errorPayload?.message)
        ? errorPayload?.message.join(', ')
        : errorPayload?.message;
      const message = payloadMessage || errorPayload?.error || `Request failed with status ${response.status}`;

      throw new ApiError(message, response.status, errorPayload?.code, errorPayload?.details);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${API_TIMEOUT_MS}ms`);
    }

    throw new Error(toErrorMessage(error));
  } finally {
    window.clearTimeout(timeoutHandle);
  }
};

const requestBlob = async (endpoint: string, options: ApiRequestOptions = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'text/csv',
      ...(getStoredAuthToken() ? { Authorization: `Bearer ${getStoredAuthToken()}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorPayload = await parseErrorPayload(response);
    throw new ApiError(
      (Array.isArray(errorPayload?.message) ? errorPayload?.message.join(', ') : errorPayload?.message)
        || errorPayload?.error
        || `Request failed with status ${response.status}`,
      response.status,
      errorPayload?.code,
      errorPayload?.details,
    );
  }

  return response.blob();
};

export const api = {
  auth: {
    getCurrentUser: () => request<User>('/auth/me'),
    updateProfile: (data: Partial<User>) => request<User>('/auth/profile', { method: 'PATCH', body: data }),
  },

  conversations: {
    getAll: () => request<Conversation[]>('/conversations'),
    getById: (id: number) => request<Conversation>(`/conversations/${id}`),
    getMessages: (conversationId: number) => request<Message[]>(`/conversations/${conversationId}/messages`),
    sendMessage: (conversationId: number, text: string, useAI: boolean) => request<Message>(
      `/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: { text, useAI },
      },
    ),
    markAsRead: (conversationId: number) => request<void>(`/conversations/${conversationId}/read`, { method: 'POST' }),
  },

  leads: {
    getAll: () => request<Lead[]>('/leads'),
    updateStatus: (id: number, status: Lead['status']) => request<Lead>(`/leads/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),
    exportCSV: () => requestBlob('/leads/export'),
  },

  aiTraining: {
    getKnowledgeBase: () => request<KnowledgeBaseItem[]>('/ai/knowledge-base'),
    addKnowledgeItem: (item: Omit<KnowledgeBaseItem, 'id' | 'embedding'>) => request<KnowledgeBaseItem>(
      '/ai/knowledge-base',
      {
        method: 'POST',
        body: item,
      },
    ),
    deleteKnowledgeItem: (id: number) => request<void>(`/ai/knowledge-base/${id}`, { method: 'DELETE' }),
    updateKnowledgeItem: (id: number, data: Partial<KnowledgeBaseItem>) => request<KnowledgeBaseItem>(
      `/ai/knowledge-base/${id}`,
      {
        method: 'PATCH',
        body: data,
      },
    ),
    trainModel: () => request<{ success: boolean; accuracy: number }>('/ai/train', { method: 'POST' }),
    testAI: (question: string) => request<{ answer: string; confidence: number }>('/ai/test', {
      method: 'POST',
      body: { question },
    }),
  },

  analytics: {
    getStats: () => request<{
      totalConversations: number;
      leadsCaptured: number;
      responseRate: number;
      conversionRate: number;
    }>('/analytics/stats'),
    getChartData: () => request<AnalyticsData>('/analytics/charts'),
  },

  settings: {
    getIntegrations: () => request<Array<{
      id: string;
      name: string;
      status: 'active' | 'inactive';
      accountName?: string;
    }>>('/settings/integrations'),
    toggleAI: (enabled: boolean) => request<{ success: boolean }>('/settings/ai-toggle', {
      method: 'POST',
      body: { enabled },
    }),
  },
};
