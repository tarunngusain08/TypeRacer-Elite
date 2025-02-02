import { useWebSocket } from '../contexts/WebSocketContext';

const GameInterface = () => {
  const { socket, connect, disconnect } = useWebSocket();

  useEffect(() => {
    // Connect when component mounts
    connect('game-id'); // Replace with actual game ID

    return () => {
      // Cleanup on unmount
      disconnect();
    };
  }, []);

  // ... rest of component
}; 