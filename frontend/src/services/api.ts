import axios, { InternalAxiosRequestConfig } from 'axios';
import { authApi } from './auth.service';
import { getErrorMessage } from '../utils/errorHandler';

// Set base URL for all requests
axios.defaults.baseURL = 'http://localhost:8080/api';
axios.defaults.withCredentials = true;

// Add auth token to requests
axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Ensure headers is defined
  config.headers = config.headers || {};
  
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

axios.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      window.location.href = '/login';
      const errorDetails = getErrorMessage(error);
      return Promise.reject(errorDetails);
    }

    const errorDetails = getErrorMessage(error);
    return Promise.reject(errorDetails);
  }
);

export const gameApi = {
  create: async (text: string) => {
    const res = await axios.post('/api/games', { text });
    return res.data;
  },

  join: async (gameId: string, player: { name: string, id: string }) => {
    const res = await axios.post(`/api/games/${gameId}/join`, player);
    return res.data;
  },

  updateProgress: async (gameId: string, progress: {
    playerId: string,
    progress: number,
    wpm: number,
    accuracy: number
  }) => {
    return axios.post(`/api/games/${gameId}/progress`, progress);
  },

  getGame: async (gameId: string) => {
    const res = await axios.get(`/api/games/${gameId}`);
    return res.data;
  },

  getActiveGames: async () => {
    const res = await axios.get('/api/games');
    return res.data;
  }
};

export default axios; 