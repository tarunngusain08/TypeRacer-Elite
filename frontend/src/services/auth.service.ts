import axios from './axios';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: {
    id: string;
    username: string;
  };
  tokens: TokenPair;
}

export const authApi = {
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>('/api/auth/login', {
        username,
        password
      });
      
      if (response.data.tokens) {
        localStorage.setItem('accessToken', response.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
        return response.data;
      }
      throw new Error('No tokens received');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response) {
        const message = typeof error.response.data === 'string' 
          ? error.response.data 
          : 'Login failed';
        throw new Error(message);
      }
      throw error;
    }
  },

  async refreshToken(): Promise<TokenPair> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post<{ tokens: TokenPair }>('/api/auth/refresh', {
        refreshToken
      });
      
      const { tokens } = response.data;
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      return tokens;
    } catch (error) {
      this.logout();
      throw error;
    }
  },

  async register(username: string, password: string) {
    try {
      const response = await axios.post('/api/auth/register', {
        username: username.trim(),
        password,
      });
      
      if (response.data.tokens) {
        localStorage.setItem('accessToken', response.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response) {
        const message = typeof error.response.data === 'string' 
          ? error.response.data 
          : 'Registration failed';
        throw new Error(message);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('Server is not responding. Please try again later.');
      } else {
        console.error('Request setup error:', error.message);
        throw new Error('Failed to make request. Please check your connection.');
      }
    }
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },

  getAccessToken() {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  async getMe() {
    try {
      const response = await axios.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  },

  async checkUsername(username: string): Promise<{ exists: boolean }> {
    try {
      const response = await axios.get(`/api/auth/check-username/${username}`);
      return response.data;
    } catch (error) {
      console.error('Username check failed:', error);
      return { exists: false };
    }
  }
}; 