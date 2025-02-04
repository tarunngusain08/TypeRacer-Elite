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

const API_URL = '/auth';

export const authApi = {
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/login`, {
        username,
        password
      });
      
      if (response.data && response.data.tokens) {
        const { accessToken, refreshToken } = response.data.tokens;
        console.log('Received tokens:', { accessToken, refreshToken }); // Debug log
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Set token for immediate use
        axios.defaults.headers.common = {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        return response.data;
      }
      throw new Error('No tokens received');
    } catch (error: any) {
      console.error('Login error:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
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
      const response = await axios.post<{ tokens: TokenPair }>(`${API_URL}/refresh`, {
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
      const response = await axios.post(`${API_URL}/register`, {
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

  logout: async () => {
    const token = localStorage.getItem('accessToken');
    try {
      await axios.post(`${API_URL}/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
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
    const token = localStorage.getItem('accessToken');
    // Decode JWT token to get user_id
    let userId = '';
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        userId = decoded.user_id;
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }

    console.log('Token for /me request:', token);
    console.log('Decoded userId:', userId);

    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: {
          'authorization': `Bearer ${token}`,
          'accept': 'application/json',
          'x-user-id': userId
        },
        withCredentials: true
      });
      console.log('ME response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user data:', {
        error,
        token,
        userId,
        headers: axios.defaults.headers
      });
      return null;
    }
  },

  async checkUsername(username: string): Promise<{ exists: boolean }> {
    try {
      const response = await axios.get(`${API_URL}/check-username/${username}`);
      return response.data;
    } catch (error) {
      console.error('Username check failed:', error);
      return { exists: false };
    }
  }
}; 