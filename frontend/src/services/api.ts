import axiosInstance from './axios';
import { authApi } from './auth.service';

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
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

export const gameApi = {
  create: async (text: string) => {
    const res = await axiosInstance.post('/games', { text });
    return res.data;
  },

  join: async (gameId: string, player: { name: string, id: string }) => {
    const res = await axiosInstance.post(`/games/${gameId}/join`, player);
    return res.data;
  },

  updateProgress: async (gameId: string, progress: {
    playerId: string,
    progress: number,
    wpm: number,
    accuracy: number
  }) => {
    return axiosInstance.post(`/games/${gameId}/progress`, progress);
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