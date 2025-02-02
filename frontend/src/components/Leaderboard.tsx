import { Trophy, Crown, Medal } from 'lucide-react';

const Leaderboard = () => {
  const players = [
    { id: 1, name: 'SpeedDemon', wpm: 85, accuracy: 98 },
    { id: 2, name: 'TypeMaster', wpm: 75, accuracy: 96 },
    { id: 3, name: 'SwiftKeys', wpm: 70, accuracy: 94 },
    { id: 4, name: 'RapidType', wpm: 65, accuracy: 92 },
  ];

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-400 animate-float" />;
      case 1: return <Medal className="w-5 h-5 text-gray-300" />;
      case 2: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return null;
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 backdrop-blur-lg animate-scale-in">
      <h3 className="text-2xl font-bold mb-6 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        <Trophy className="w-6 h-6 mr-2 text-yellow-400 animate-bounce-in" />
        Leaderboard
      </h3>
      <div className="space-y-3">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between bg-gray-800/30 p-4 rounded-xl border border-gray-700/50
                     transform transition-all duration-300 hover:scale-105 hover:bg-gray-800/50
                     animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center space-x-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse-glow" />
                <div className="absolute inset-0 flex items-center justify-center font-bold">
                  {getRankIcon(index) || `#${index + 1}`}
                </div>
              </div>
              <span className="font-semibold">{player.name}</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-purple-400 font-mono">{player.wpm}</span>
                <span className="text-sm text-gray-400">WPM</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-pink-400 font-mono">{player.accuracy}</span>
                <span className="text-sm text-gray-400">%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard; 