import { authService } from './auth.service';
import axios from 'axios';
import { authApi } from './auth.service';

const API_BASE = 'http://localhost:8080/api';

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const api = axios.create({
  baseURL: API_BASE
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = authApi.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { accessToken } = await authApi.refreshToken();
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authApi.logout();
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const gameApi = {
  create: async (text: string) => {
    const res = await api.post('/games', { text });
    return res.data;
  },

  join: async (gameId: string, player: { name: string, id: string }) => {
    const res = await api.post(`/games/${gameId}/join`, player);
    return res.data;
  },

  updateProgress: async (gameId: string, progress: {
    playerId: string,
    progress: number,
    wpm: number,
    accuracy: number
  }) => {
    return api.post(`/games/${gameId}/progress`, progress);
  },

  getGame: async (gameId: string) => {
    const res = await api.get(`/games/${gameId}`);
    return res.data;
  },

  getActiveGames: async () => {
    const res = await api.get('/games');
    return res.data;
  }
};

export const authApi = {
  register: async (userData: { username: string; email: string; password: string }) => {
    const res = await api.post('/auth/register', userData);
    const data = res.data;
    if (data.token) {
      authService.setToken(data.token);
    }
    return data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login', credentials);
    const data = res.data;
    if (data.token) {
      authService.setToken(data.token);
    }
    return data;
  },

  logout: () => {
    authService.removeToken();
  }
};

export default api; 