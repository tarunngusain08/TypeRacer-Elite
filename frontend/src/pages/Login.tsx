import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6">Sign In</h2>
        <LoginForm onSuccess={() => navigate('/')} />
        <p className="mt-4 text-center">
          Don't have an account?{' '}
          <button 
            onClick={() => navigate('/register')} 
            className="text-purple-400 hover:text-purple-300"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login; 