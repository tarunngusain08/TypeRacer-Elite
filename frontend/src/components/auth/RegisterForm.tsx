import { useState } from 'react';
import { authApi } from '../../services/api';

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await authApi.register({ username, email, password });
      if (response.token) {
        localStorage.setItem('token', response.token);
        onSuccess();
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-gray-400 mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-gray-800/30 rounded-lg p-3 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          required
        />
      </div>

      <div>
        <label className="block text-gray-400 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-800/30 rounded-lg p-3 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          required
        />
      </div>

      <div>
        <label className="block text-gray-400 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-800/30 rounded-lg p-3 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
      >
        Sign Up
      </button>
    </form>
  );
};

export default RegisterForm; 