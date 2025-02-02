import React from 'react';
import { Trophy, Timer } from 'lucide-react';

const SpectatorView = () => {
  const players = [
    { 
      id: 1, 
      name: 'SpeedDemon', 
      wpm: 85, 
      accuracy: 98, 
      progress: 75,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop'
    },
    { 
      id: 2, 
      name: 'TypeMaster', 
      wpm: 75, 
      accuracy: 96, 
      progress: 65,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop'
    },
    { 
      id: 3, 
      name: 'SwiftKeys', 
      wpm: 70, 
      accuracy: 94, 
      progress: 60,
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=50&h=50&fit=crop'
    },
    { 
      id: 4, 
      name: 'RapidType', 
      wpm: 65, 
      accuracy: 92, 
      progress: 55,
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=50&h=50&fit=crop'
    },
  ];

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Live Race
        </h2>
        <div className="flex items-center space-x-3 bg-gray-800/50 px-4 py-2 rounded-lg">
          <Timer className="w-6 h-6 text-purple-400" />
          <span className="text-2xl font-mono">60s</span>
        </div>
      </div>

      <div className="space-y-6">
        {players.map((player) => (
          <div key={player.id} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={player.avatar}
                  alt={player.name}
                  className="w-10 h-10 rounded-full border-2 border-purple-500"
                />
                <div>
                  <h3 className="font-semibold text-lg">{player.name}</h3>
                  <div className="flex space-x-4 text-sm text-gray-400">
                    <span>{player.wpm} WPM</span>
                    <span>{player.accuracy}% Accuracy</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                  style={{ width: `${player.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpectatorView;