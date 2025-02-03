import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { authApi } from '../../services/auth.service';
import { Check, X, Eye, EyeOff, Loader } from 'lucide-react';

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
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const [validations, setValidations] = useState({
    length: false,
    number: false,
    letter: false,
    match: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const passwordRules: Record<string, ValidationRule> = {
    length: {
      test: (value) => value.length >= 8,
      message: 'At least 8 characters'
    },
    number: {
      test: (value) => /\d/.test(value),
      message: 'Contains a number'
    },
    letter: {
      test: (value) => /[a-zA-Z]/.test(value),
      message: 'Contains a letter'
    }
  };

  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length < 3) return;
      
      setIsCheckingUsername(true);
      try {
        const response = await authApi.checkUsername(formData.username);
        if (response.exists) {
          setUsernameError('This username is already taken');
        } else {
          setUsernameError('');
        }
      } catch (error) {
        console.error('Username check failed:', error);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  useEffect(() => {
    const newValidations = {
      length: passwordRules.length.test(formData.password),
      number: passwordRules.number.test(formData.password),
      letter: passwordRules.letter.test(formData.password),
      match: formData.password === formData.confirmPassword
    };
    setValidations(newValidations);
  }, [formData.password, formData.confirmPassword]);

  const handleInputFocus = () => setIsTyping(true);
  const handleInputBlur = () => setIsTyping(false);

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
    <motion.form 
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Username</label>
        <motion.div
          className="relative"
          whileFocus={{ scale: 1.01 }}
        >
          <input
            type="text"
            value={formData.username}
            onChange={(e) => {
              setError('');
              setFormData(prev => ({ ...prev, username: e.target.value }));
            }}
            className="w-full px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-lg 
                     border border-gray-700 focus:outline-none focus:border-purple-500 
                     focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            placeholder="3-20 characters"
            required
            minLength={3}
            maxLength={20}
            disabled={isLoading}
          />
          <AnimatePresence>
            {isCheckingUsername && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Loader className="w-5 h-5 animate-spin text-purple-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        {usernameError && (
          <span className="text-red-500 text-sm">{usernameError}</span>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Password</label>
        <motion.div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => {
              setError('');
              setFormData(prev => ({ ...prev, password: e.target.value }));
            }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="w-full px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-lg 
                     border border-gray-700 focus:outline-none focus:border-purple-500 
                     focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            placeholder="At least 8 characters"
            required
            minLength={8}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                     hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </motion.div>

        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1 mt-2"
            >
              {Object.entries(passwordRules).map(([key, rule]) => (
                <motion.div
                  key={key}
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {validations[key as keyof typeof validations] ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-400">{rule.message}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Confirm Password</label>
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
      
      <motion.button
        type="submit"
        disabled={isLoading || !Object.values(validations).every(Boolean)}
        className={`
          w-full py-3 relative overflow-hidden rounded-lg font-semibold
          ${isLoading || !Object.values(validations).every(Boolean)
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader className="w-5 h-5 animate-spin mr-2" />
            Creating Account...
          </span>
        ) : (
          'Create Account'
        )}
      </motion.button>
    </motion.form>
  );
};

export default RegisterForm; 