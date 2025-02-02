import React, { useState, useEffect } from 'react';
import { Trophy, Users, Eye, Timer } from 'lucide-react';
import GameInterface from './components/GameInterface';
import SpectatorView from './components/SpectatorView';
import MatchResults from './components/MatchResults';

function App() {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSpectator, setIsSpectator] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [gameId, setGameId] = useState('');

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !hasCompleted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft, hasCompleted]);

  const handlePlayClick = async () => {
    setIsSpectator(false);
    if (!hasGameStarted) {
      // Create a new game in the backend via the REST API
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/games`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: "The quick brown fox jumps over the lazy dog. As the sun sets behind the mountains, casting long shadows across the valley, a gentle breeze rustles through the leaves." })
        });
        if (!res.ok) {
          throw new Error('Failed to create game');
        }
        const game = await res.json();
        setGameId(game.id);
      } catch (error) {
        console.error(error);
      }
      setGameState('playing');
      setTimeLeft(60);
      setHasGameStarted(true);
      setHasCompleted(false);
    }
  };

  const handleSpectateClick = () => {
    setIsSpectator(true);
  };

  const handleNewGame = () => {
    setGameState('playing');
    setTimeLeft(60);
    setHasGameStarted(true);
    setHasCompleted(false);
  };

  const handleGameComplete = (wpm: number, accuracy: number) => {
    setHasCompleted(true);
    setIsSpectator(true);
    console.log(`Game completed! WPM: ${wpm}, Accuracy: ${accuracy}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              TypeRacer Elite
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePlayClick}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                !isSpectator 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Play</span>
            </button>
            <button
              onClick={handleSpectateClick}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                isSpectator 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span>Spectate</span>
            </button>
          </div>
        </div>
        {/* Main Content */}
        {isSpectator ? (
          <SpectatorView />
        ) : (
          <div className="space-y-6">
            {gameState === 'waiting' && !hasGameStarted && (
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl text-center">
                <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  Ready to Race?
                </h2>
                <p className="text-gray-400 mb-6">Show off your typing skills and compete with others!</p>
                <button
                  onClick={handlePlayClick}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
                >
                  Start Game
                </button>
              </div>
            )}
            {gameState === 'playing' && (
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Race #{Math.floor(Math.random() * 1000)}
                  </h2>
                  <div className="flex items-center space-x-3 bg-gray-800/50 px-4 py-2 rounded-lg">
                    <Timer className="w-6 h-6 text-purple-400" />
                    <span className="text-2xl font-mono">{timeLeft}s</span>
                  </div>
                </div>
                {/* Pass the created gameId to the GameInterface */}
                <GameInterface gameId={gameId} onComplete={handleGameComplete} />
              </div>
            )}
            {gameState === 'finished' && (
              <>
                <MatchResults />
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleNewGame}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
                  >
                    Play Again
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
