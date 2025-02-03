import axios from 'axios';
import { authApi } from './auth.service';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config: any) => {
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

axiosInstance.interceptors.response.use(
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
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { accessToken } = await authApi.refreshToken();
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
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

interface GameProgress {
  progress: number;
  wpm: number;
  accuracy: number;
}

export const gameApi = {
  async createGame() {
    const response = await axiosInstance.post('/games');
    return response.data;
  },

  async joinGame(gameId: string) {
    const response = await axiosInstance.post(`/games/${gameId}/join`);
    return response.data;
  },

  async updateProgress(gameId: string, progress: GameProgress) {
    const response = await axiosInstance.post(`/games/${gameId}/progress`, progress);
    return response.data;
  },

  async endGame(gameId: string, stats: { wpm: number; accuracy: number }) {
    const response = await axiosInstance.post(`/games/${gameId}/end`, stats);
    return response.data;
  },

  async getLeaderboard() {
    const response = await axiosInstance.get('/leaderboard');
    return response.data;
  },

  getGame: async (gameId: string) => {
    const res = await axiosInstance.get(`/games/${gameId}`);
    return res.data;
  },

  getActiveGames: async () => {
    const res = await axiosInstance.get('/games');
    return res.data;
  }
};

export default axiosInstance; 