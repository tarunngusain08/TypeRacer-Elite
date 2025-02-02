import { useState, useEffect } from 'react';
import { Trophy, Users, Eye, Timer } from 'lucide-react';
import GameInterface from './components/game/GameInterface';
import SpectatorView from './components/game/SpectatorView';
import MatchResults from './components/game/MatchResults';
import AuthModal from './components/auth/AuthModal';
import { gameApi } from './services/api';
import { useWebSocket } from './hooks/useWebSocket';
import { v4 as uuid } from 'uuid';
import { authService, authApi } from './services/auth.service';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSpectator, setIsSpectator] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId] = useState(() => uuid()); // Generate unique player ID
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  
  // Use WebSocket when we have a gameId
  const { isConnected, gameState: wsGameState } = useWebSocket(gameId || '');

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !hasCompleted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
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

  // Update game state based on WebSocket messages
  useEffect(() => {
    if (wsGameState) {
      setGameState(wsGameState.status);
      // Update other game state from WebSocket...
    }
  }, [wsGameState]);

  useEffect(() => {
    // Check token validity on mount
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handleStartGameClick = () => {
    if (!isAuthenticated) {
      // Show auth modal if user is not authenticated
      setShowAuthModal(true);
    } else {
      // Start the game if user is authenticated
      handlePlayClick();
    }
  };

  const handlePlayClick = async () => {
    try {
      // Create a new game
      const game = await gameApi.create("Sample text for typing...");
      setGameId(game.id);
      
      // Join the game
      await gameApi.join(game.id, {
        id: playerId,
        name: "Player" + Math.floor(Math.random() * 1000)
      });

      setGameState('playing');
      setIsSpectator(false);
    } catch (error) {
      console.error('Failed to start game:', error);
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

  const handleGameComplete = async (wpm: number, accuracy: number) => {
    if (gameId) {
      try {
        await gameApi.updateProgress(gameId, {
          playerId,
          progress: 100,
          wpm,
          accuracy
        });
        setHasCompleted(true);
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
  };

  return (
    <AuthProvider>
      <ToastProvider>
        <WebSocketProvider>
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
                  {isAuthenticated ? (
                    <>
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
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
                    >
                      Sign In to Play
                    </button>
                  )}
                </div>
              </div>

              {/* Auth Modal */}
              {showAuthModal && (
                <AuthModal
                  onClose={() => setShowAuthModal(false)}
                  onSuccess={() => {
                    handleAuthSuccess();
                    // Start the game after successful authentication
                    handlePlayClick();
                  }}
                />
              )}

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
                      <p className="text-gray-400 mb-6">
                        {isAuthenticated 
                          ? "Show off your typing skills and compete with others!"
                          : "Sign in to start racing and track your progress!"}
                      </p>
                      <button
                        onClick={handleStartGameClick}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
                      >
                        {isAuthenticated ? "Start Game" : "Sign In to Play"}
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
                      <GameInterface 
                        gameId={gameId || ''} 
                        playerId={playerId}
                        onComplete={handleGameComplete} 
                      />
                    </div>
                  )}
                  {gameState === 'finished' && gameId && (
                    <>
                      <MatchResults gameId={gameId} />
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
        </WebSocketProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;