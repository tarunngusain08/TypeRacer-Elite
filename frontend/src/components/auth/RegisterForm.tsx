import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (formData.username.trim() === '') {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (formData.username.length > 20) {
      setError('Username cannot exceed 20 characters');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password.length > 50) {
      setError('Password cannot exceed 50 characters');
      return false;
    }
    if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(formData.password)) {
      setError('Password must contain both letters and numbers');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.username.trim(), formData.password);
      showToast('Registration successful! Please sign in.', 'success');
      onSuccess();
    } catch (err: any) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. ';
      
      if (err.message.includes('username already exists')) {
        errorMessage = 'This username is already taken. Please choose another one.';
      } else if (err.message.includes('validation failed')) {
        errorMessage = 'Please check your username and password requirements.';
      } else if (err.message.includes('Server is not responding')) {
        errorMessage = 'Server is not responding. Please try again later.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => {
            setError('');
            setFormData(prev => ({ ...prev, username: e.target.value }));
          }}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
          placeholder="3-20 characters"
          required
          minLength={3}
          maxLength={20}
          disabled={isLoading}
        />
        <p className="text-xs text-gray-400">Must be 3-20 characters long</p>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => {
            setError('');
            setFormData(prev => ({ ...prev, password: e.target.value }));
          }}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
          placeholder="At least 6 characters"
          required
          minLength={6}
          disabled={isLoading}
        />
        <p className="text-xs text-gray-400">Must contain letters and numbers</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1">Confirm Password</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => {
            setError('');
            setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
          }}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
          placeholder="Confirm your password"
          required
          disabled={isLoading}
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold 
          transition-all duration-300
          ${isLoading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-lg hover:shadow-purple-500/30'
          }
        `}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default RegisterForm; 