import axios from 'axios';

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
      const response = await axios.post('/api/auth/login', {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
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
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                           error.response.data || 
                           'Failed to login. Please check your credentials.';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Server is not responding. Please try again later.');
      } else {
        // Error in request setup
        throw new Error('Failed to make request. Please check your connection.');
      }
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
        username,
        password
      });
      
      if (response.data.tokens) {
        localStorage.setItem('accessToken', response.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to register');
      }
      throw new Error('Network error occurred');
    }
  },

  logout: async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to check username');
      }
      throw new Error('Network error occurred');
    }
  }
}; 