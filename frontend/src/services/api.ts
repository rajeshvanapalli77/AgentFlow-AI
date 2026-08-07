import axios from 'axios';

const API_BASE_URL = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (email: string, password: string, full_name: string, role = 'user') => {
    const res = await api.post('/auth/register', { email, password, full_name, role });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const ChatService = {
  createSession: async (title?: string) => {
    const res = await api.post('/chat/sessions', { title });
    return res.data;
  },
  getSessions: async () => {
    const res = await api.get('/chat/sessions');
    return res.data;
  },
  getMessages: async (sessionId: string) => {
    const res = await api.get(`/chat/sessions/${sessionId}/messages`);
    return res.data;
  },
  executeChat: async (message: string, sessionId?: string, requireApproval = false) => {
    const res = await api.post('/chat/execute', {
      message,
      session_id: sessionId,
      require_approval: requireApproval
    });
    return res.data;
  }
};

export const AgentService = {
  listAgents: async () => {
    const res = await api.get('/agents');
    return res.data;
  }
};

export const DocumentService = {
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  listDocuments: async () => {
    const res = await api.get('/documents');
    return res.data;
  },
  searchDocuments: async (query: string) => {
    const res = await api.post('/documents/search', { query, top_k: 4 });
    return res.data;
  }
};

export const ResearchService = {
  executeResearch: async (topic: string, depth = 'deep') => {
    const res = await api.post('/research/execute', { topic, depth });
    return res.data;
  }
};

export const MemoryService = {
  listMemories: async (type?: string) => {
    const res = await api.get('/memory', { params: { memory_type: type } });
    return res.data;
  },
  createMemory: async (memory_type: string, key: string, content: string) => {
    const res = await api.post('/memory', { memory_type, key, content });
    return res.data;
  }
};

export const TracingService = {
  getRuns: async () => {
    const res = await api.get('/tracing/runs');
    return res.data;
  },
  getAnalytics: async () => {
    const res = await api.get('/tracing/analytics');
    return res.data;
  }
};

export const EvaluationService = {
  getMetrics: async () => {
    const res = await api.get('/evaluation/metrics');
    return res.data;
  },
  listEvaluations: async () => {
    const res = await api.get('/evaluation');
    return res.data;
  }
};

export const SettingsService = {
  getSettings: async () => {
    const res = await api.get('/settings');
    return res.data;
  },
  updateSetting: async (setting_key: string, setting_value: string) => {
    const res = await api.post('/settings', { setting_key, setting_value });
    return res.data;
  }
};
