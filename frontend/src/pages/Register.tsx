import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/login');
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Create Account</h1>
      <RegisterForm onSuccess={handleRegisterSuccess} />
      <p className="text-center mt-4 text-gray-400">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-purple-400 hover:text-purple-300"
        >
          Sign In
        </button>
      </p>
    </div>
  );
};

export default Register; 