import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/auth.service';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null
  });

  const navigate = useNavigate();
  const location = useLocation();

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (decodedToken.exp * 1000 < Date.now()) {
          logout();
          return false;
        }
        return true;
      } catch {
        logout();
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    const initAuth = async () => {
      const isValid = checkTokenExpiration();
      setState(prev => ({ ...prev, isAuthenticated: isValid }));
      if (isValid) {
        await fetchUserData();
      }
      setState(prev => ({ ...prev, isLoading: false }));
    };
    
    initAuth();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Fetch user data using token
        // const userData = await authApi.getMe();
        // setState(prev => ({ ...prev, user: userData }));
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      logout();
    }
  };

  const login = async (username: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authApi.login(username, password);
      setState({
        isAuthenticated: true,
        user: response.user,
        isLoading: false,
        error: null
      });
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
    await authApi.register(username, password);
    // After registration, user needs to login
  };

  const handleLogout = () => {
    authApi.logout();
    if (window.gameSocket) {
      window.gameSocket.close();
    }
    setGameState(null);
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      user: null,
    }));
    navigate('/');
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