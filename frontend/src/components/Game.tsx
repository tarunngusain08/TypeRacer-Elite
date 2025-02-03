import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameApi } from '../services/api';
import { showToast } from '../utils/toast';

const Game = () => {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState('');
  const [gameState, setGameState] = useState('loading');
  const [gameStats, setGameStats] = useState({ wpm: 0, accuracy: 0 });

  const handleGameComplete = async (stats: { wpm: number; accuracy: number }) => {
    try {
      // Save game results
      await gameApi.endGame(gameId, stats);
      
      // Show results
      setGameState('finished');
      setGameStats(stats);
      
      // Navigate to results
      navigate(`/results/${gameId}`, { 
        state: { 
          wpm: stats.wpm, 
          accuracy: stats.accuracy 
        } 
      });
    } catch (error) {
      console.error('Failed to save game results:', error);
      showToast('Failed to save game results', 'error');
    }
  };

  const handleProgress = async (progress: number, currentStats: { wpm: number; accuracy: number }) => {
    try {
      await gameApi.updateProgress(gameId, {
        progress,
        wpm: currentStats.wpm,
        accuracy: currentStats.accuracy
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  // ... rest of the component
};

export default Game; 