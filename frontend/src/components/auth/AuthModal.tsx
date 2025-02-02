import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal = ({ onClose, onSuccess }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSwitchForm = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-800 w-full max-w-md animate-scale-in">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 animate-bounce-in">
            {isLogin ? 'Welcome Back!' : 'Join TypeRacer Elite'}
          </h2>
          
          <div className={`transition-all duration-300 transform ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {isLogin ? (
              <LoginForm onSuccess={onSuccess} />
            ) : (
              <RegisterForm onSuccess={() => {
                setIsLogin(true);
              }} />
            )}
          </div>
          
          <div className="text-center text-sm text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={handleSwitchForm}
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300"
            >
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 