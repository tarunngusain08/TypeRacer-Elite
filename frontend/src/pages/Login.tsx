import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import ParticlesBackground from '../components/ui/ParticlesBackground';
import GlassCard from '../components/ui/GlassCard';
import AnimatedHeader from '../components/ui/AnimatedHeader';
import axios from '../services/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      navigate('/'); // Redirect to home page
    } catch (error) {
      console.error('Login failed', error);
      setError('Invalid credentials');
    }
  };

  return (
    <>
      <ParticlesBackground />
      <motion.div 
        className="relative z-10 max-w-md mx-auto p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard>
          <AnimatedHeader 
            title="Welcome Back" 
            subtitle="Ready to race? Sign in to continue"
          />

          <div className="mt-8">
            <LoginForm onSuccess={handleLogin} />
          </div>

          <motion.p 
            className="text-center mt-6 text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Don't have an account?{' '}
            <motion.button
              onClick={() => navigate('/register')}
              className="text-purple-400 hover:text-purple-300 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Account
            </motion.button>
          </motion.p>
        </GlassCard>
      </motion.div>
    </>
  );
};

export default Login;