import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal = ({ onClose, onSuccess }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="modal-container bg-gray-900/90 rounded-2xl p-8 border border-gray-800 shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          {isLogin ? 'Welcome Back!' : 'Join TypeRacer Elite'}
        </h2>
        
        {isLogin ? (
          <LoginForm onSuccess={onSuccess} />
        ) : (
          <RegisterForm onSuccess={onSuccess} />
        )}

        <div className="auth-toggle mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 