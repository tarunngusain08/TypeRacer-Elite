export const authService = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token: string) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token')
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