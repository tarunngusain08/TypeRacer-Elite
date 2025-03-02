import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import axios from '../services/axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/register', { username, password });
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      navigate('/'); // Redirect to home page
    } catch (error) {
      console.error('Registration failed', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Create Account</h1>
      <RegisterForm onSuccess={handleRegister} />
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