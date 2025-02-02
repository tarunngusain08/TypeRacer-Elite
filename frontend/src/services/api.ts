import { authService } from './auth.service';

const API_BASE = 'http://localhost:8080/api';

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const gameApi = {
  create: async (text: string) => {
    const res = await fetch(`${API_BASE}/games`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  join: async (gameId: string, player: { name: string, id: string }) => {
    const res = await fetch(`${API_BASE}/games/${gameId}/join`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(player)
    });
    return res.json();
  },

  updateProgress: async (gameId: string, progress: {
    playerId: string,
    progress: number,
    wpm: number,
    accuracy: number
  }) => {
    return fetch(`${API_BASE}/games/${gameId}/progress`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(progress)
    });
  },

  getGame: async (gameId: string) => {
    const res = await fetch(`${API_BASE}/games/${gameId}`);
    return res.json();
  },

  getActiveGames: async () => {
    const res = await fetch(`${API_BASE}/games`);
    return res.json();
  }
};

export const authApi = {
  register: async (userData: { username: string; email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.token) {
      authService.setToken(data.token);
    }
    return data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (data.token) {
      authService.setToken(data.token);
    }
    return data;
  },

  logout: () => {
    authService.removeToken();
  }
}; 