import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GameInterface from '../components/game/GameInterface';
import SpectatorView from '../components/game/SpectatorView';

const Game = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSpectator, setIsSpectator] = useState(false);

  const handleExit = () => {
    if (confirm('Are you sure you want to exit the game?')) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Game #{id}</h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsSpectator(!isSpectator)}
            className="px-4 py-2 bg-purple-600 rounded-lg"
          >
            {isSpectator ? 'Join Game' : 'Spectate'}
          </button>
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-red-600 rounded-lg"
          >
            Exit Game
          </button>
        </div>
      </div>

      {isSpectator ? (
        <SpectatorView gameId={id!} />
      ) : (
        <GameInterface gameId={id!} />
      )}
    </div>
  );
};

export default Game; 