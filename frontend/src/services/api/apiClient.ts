import { authService } from '../auth';

const API_BASE = 'http://localhost:8080/api';

export const apiClient = {
  get: async <T>(endpoint: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: getHeaders()
    });
    return res.json() as Promise<T>;
  },

  post: async <T>(endpoint: string, data: any) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json() as Promise<T>;
  }
};

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
} 