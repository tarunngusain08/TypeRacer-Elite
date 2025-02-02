import { useEffect, useState } from 'react';
import { gameApi } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Game } from '../../types/game';
import { Timer } from 'lucide-react';

export const SpectatorView = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const { gameState } = useWebSocket(selectedGameId || '');

  useEffect(() => {
    // Fetch active games
    const fetchGames = async () => {
      try {
        const activeGames = await gameApi.getActiveGames();
        setGames(activeGames);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      }
    };

    fetchGames();
    // Poll for new games every 5 seconds
    const interval = setInterval(fetchGames, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update selected game data when websocket sends updates
  useEffect(() => {
    if (gameState && selectedGameId) {
      setGames(prevGames => 
        prevGames.map(game => 
          game.id === selectedGameId ? { ...game, ...gameState } : game
        )
      );
    }
  }, [gameState, selectedGameId]);

  return (
    <div className="spec-view space-y-8">
      <h2 className="view-title text-2xl font-bold text-center">Active Races</h2>
      <div className="game-grid grid gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            className="game-card bg-gray-800/30 rounded-xl p-6 border border-gray-700/50"
            onClick={() => setSelectedGameId(game.id)}
          >
            <div className="card-header flex justify-between items-center mb-4">
              <h3 className="game-id text-xl font-semibold">Race #{game.id.slice(0, 8)}</h3>
              <span className="game-status px-3 py-1 rounded-full bg-gray-700 text-sm">
                {game.status}
              </span>
            </div>
            
            <div className="player-list space-y-4">
              {game.players.map((player) => (
                <div key={player.id} className="player-row flex justify-between items-center">
                  <span className="player-name">{player.name}</span>
                  <div className="player-stats flex space-x-4">
                    <span>{player.wpm} WPM</span>
                    <span>{player.accuracy}%</span>
                    <span>{player.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpectatorView;