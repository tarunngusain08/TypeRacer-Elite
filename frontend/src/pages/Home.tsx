import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handlePlayClick = () => {
    if (isAuthenticated) {
      navigate('/game/new'); // You'll need to create a new game endpoint
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold">TypeRacer Elite</h1>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={handlePlayClick}
                className="px-6 py-3 bg-purple-600 rounded-lg"
              >
                <Users className="w-5 h-5 inline mr-2" />
                Play
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-700 rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-purple-600 rounded-lg"
            >
              Sign In to Play
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 