import { useEffect, useState } from 'react';
import { Trophy, Target, Zap } from 'lucide-react';
import { gameApi } from '../../services/api';
import { Game } from '../../types/game';

interface MatchResultsProps {
  gameId: string;
}

export const MatchResults = ({ gameId }: MatchResultsProps) => {
  const [gameResults, setGameResults] = useState<Game | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const game = await gameApi.getGame(gameId);
        setGameResults(game);
      } catch (error) {
        console.error('Failed to fetch game results:', error);
      }
    };

    fetchResults();
  }, [gameId]);

  if (!gameResults) {
    return <div>Loading results...</div>;
  }

  // Sort players by WPM
  const sortedPlayers = [...gameResults.players].sort((a, b) => b.wpm - a.wpm);

  return (
    <div className="results-panel bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl">
      <h2 className="title-text text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Race Results
      </h2>

      <div className="results-list space-y-4">
        {sortedPlayers.map((player, index) => (
          <div 
            key={player.id} 
            className={`result-card bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 transform transition-all duration-300 ${
              index === 0 ? 'top-rank scale-105 border-yellow-500/50' : ''
            }`}
          >
            <div className="card-content flex items-center justify-between">
              <div className="user-info flex items-center space-x-4">
                <div className="avatar-box relative">
                  <div className="user-pic w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    {player.name.charAt(0)}
                  </div>
                  {index === 0 && (
                    <Trophy className="rank-icon w-6 h-6 text-yellow-400 absolute -top-2 -right-2" />
                  )}
                </div>
                <div className="user-meta">
                  <h3 className="user-name font-semibold text-lg">{player.name}</h3>
                  <p className="rank-text text-gray-400">#{index + 1} Place</p>
                </div>
              </div>
              
              <div className="stat-box flex space-x-6">
                <div className="wpm-box flex items-center space-x-2">
                  <Zap className="stat-icon w-5 h-5 text-purple-400" />
                  <span className="stat-val font-mono font-semibold">{player.wpm} WPM</span>
                </div>
                <div className="acc-box flex items-center space-x-2">
                  <Target className="stat-icon w-5 h-5 text-pink-400" />
                  <span className="stat-val font-mono font-semibold">{player.accuracy}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchResults;