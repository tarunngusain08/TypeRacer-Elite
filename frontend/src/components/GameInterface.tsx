import { useWebSocket } from '../contexts/WebSocketContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GameInterface = () => {
  const { socket, connect, disconnect } = useWebSocket();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Connect when component mounts
    connect('game-id'); // Replace with actual game ID

    return () => {
      // Cleanup on unmount
      disconnect();
    };
  }, []);

  const handleExit = () => {
    if (confirm('Are you sure you want to exit the game?')) {
      setGameState('finished');
      navigate('/');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Game in Progress</h2>
        <button
          onClick={handleExit}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
        >
          Exit Game
        </button>
      </div>
      {/* existing game interface */}
    </div>
  );
}; 