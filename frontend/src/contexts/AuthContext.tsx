import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../services/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setError: (error: string | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  setError: () => {},
});

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: string | null;
}

interface GameState {
  // Define the structure of your GameState here
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null
  });

  const [gameState, setGameState] = useState<GameState | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (decodedToken.exp * 1000 < Date.now()) {
          handleLogout();
          return false;
        }
        return true;
      } catch {
        handleLogout();
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token validity
          const isValid = checkTokenExpiration();
          if (isValid) {
            // Verify token with backend
            const userData = await axios.get('/auth/me');
            if (userData) {
              setState(prev => ({
                ...prev,
                isAuthenticated: true,
                user: userData.data,
                isLoading: false
              }));
            } else {
              // If getMe fails, clear everything
              handleLogout();
            }
            // If we're on login page and user is authenticated, redirect to home
            if (location.pathname === '/login') {
              navigate('/dashboard');
            }
            return;
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          handleLogout();
        }
      }
      setState(prev => ({ ...prev, isLoading: false }));
    };
    
    initAuth();
  }, [navigate, location.pathname]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const userData = await axios.get('/auth/me');
        setState(prev => ({ ...prev, user: userData.data }));
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      handleLogout();
    }
  };

  const login = async (username: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await axios.post('/auth/login', { username, password });
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      setState({
        isAuthenticated: true,
        user: response.data.user,
        isLoading: false,
        error: null
      });
      navigate('/dashboard');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Invalid credentials'
      }));
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    await axios.post('/auth/register', { username, password });
    // After registration, user needs to login
  };

  const handleLogout = () => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    if (window.gameSocket) {
      window.gameSocket.close();
    }
    
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      user: null,
    }));
    
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      ...state,
      login,
      register,
      logout: handleLogout,
      setError 
    }}>
      {state.isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);