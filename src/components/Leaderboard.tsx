import React from 'react';
import { Trophy } from 'lucide-react';

const Leaderboard = () => {
  const players = [
    { id: 1, name: 'SpeedDemon', wpm: 85, accuracy: 98 },
    { id: 2, name: 'TypeMaster', wpm: 75, accuracy: 96 },
    { id: 3, name: 'SwiftKeys', wpm: 70, accuracy: 94 },
    { id: 4, name: 'RapidType', wpm: 65, accuracy: 92 },
  ];

  return (
    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Trophy className="w-5 h-5 mr-2" />
        Leaderboard
      </h3>
      <div className="space-y-3">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between bg-white/5 p-3 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg font-semibold">#{index + 1}</span>
              <span>{player.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{player.wpm} WPM</span>
              <span className="text-sm text-gray-400">{player.accuracy}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;