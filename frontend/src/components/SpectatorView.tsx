import { useState, useEffect, useRef } from 'react';

const SpectatorView = ({ gameId }: { gameId: string }) => {
  const [spectators, setSpectators] = useState<number>(0);
  const [gameState, setGameState] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to game's WebSocket
    wsRef.current = new WebSocket(`${import.meta.env.VITE_WS_URL}/game/${gameId}`);
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setGameState(data);
    };

    return () => {
      wsRef.current?.close();
    };
  }, [gameId]);

  return (
    <div>
      <h2>Spectating Game</h2>
      <div className="text-sm text-gray-400">
        {spectators} watching
      </div>
      {/* Display game state */}
      {gameState && (
        <div className="mt-4">
          {/* Show players and their progress */}
          {gameState.players.map((player: any) => (
            <div key={player.id} className="mb-2">
              <div className="flex justify-between">
                <span>{player.username}</span>
                <span>{player.wpm} WPM</span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full">
                <div
                  className="bg-green-500 h-full rounded-full"
                  style={{ width: `${player.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpectatorView; 