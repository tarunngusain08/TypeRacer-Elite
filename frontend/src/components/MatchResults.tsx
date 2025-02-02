import React from 'react';
import { Trophy, Target, Zap } from 'lucide-react';

const MatchResults = () => {
  const results = [
    { 
      id: 1, 
      name: 'SpeedDemon', 
      wpm: 85, 
      accuracy: 98,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop'
    },
    { 
      id: 2, 
      name: 'TypeMaster', 
      wpm: 75, 
      accuracy: 96,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop'
    },
    { 
      id: 3, 
      name: 'SwiftKeys', 
      wpm: 70, 
      accuracy: 94,
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=50&h=50&fit=crop'
    },
    { 
      id: 4, 
      name: 'RapidType', 
      wpm: 65, 
      accuracy: 92,
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=50&h=50&fit=crop'
    },
  ];

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Race Results
      </h2>

      <div className="space-y-4">
        {results.map((player, index) => (
          <div 
            key={player.id} 
            className={`bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 transform transition-all duration-300 ${
              index === 0 ? 'scale-105 border-yellow-500/50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-12 h-12 rounded-full border-2 border-purple-500"
                  />
                  {index === 0 && (
                    <Trophy className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{player.name}</h3>
                  <p className="text-gray-400">#{index + 1} Place</p>
                </div>
              </div>
              
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <span className="font-mono font-semibold">{player.wpm} WPM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-pink-400" />
                  <span className="font-mono font-semibold">{player.accuracy}%</span>
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