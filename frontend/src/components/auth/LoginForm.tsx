import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { motion } from 'framer-motion';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      showToast('Login successful!', 'success');
      onSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
      showToast(err.message || 'Failed to login', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {error && (
        <motion.div 
          className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.div>
      )}
      
      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1">Username</label>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="text"
          value={username}
          onChange={(e) => {
            setError('');
            setUsername(e.target.value);
          }}
          className="w-full px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 
                     focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                     transition-all duration-300"
          placeholder="Enter your username"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1">Password</label>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="password"
          value={password}
          onChange={(e) => {
            setError('');
            setPassword(e.target.value);
          }}
          className="w-full px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 
                     focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                     transition-all duration-300"
          placeholder="Enter your password"
          required
          disabled={isLoading}
        />
      </div>

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold 
          transition-all duration-300 relative overflow-hidden group
          ${isLoading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-lg hover:shadow-purple-500/30 hover:from-purple-500 hover:to-pink-500'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner />
            <span>Signing In...</span>
          </div>
        ) : (
          <>
            <span className="relative z-10">Sign In</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300" />
          </>
        )}
      </motion.button>
    </motion.form>
  );
};

export default LoginForm; 