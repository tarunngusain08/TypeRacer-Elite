import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
        <RegisterForm onSuccess={() => navigate('/login')} />
        <p className="mt-4 text-center">
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/login')} 
            className="text-purple-400 hover:text-purple-300"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register; 