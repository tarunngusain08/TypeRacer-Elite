import React from 'react';
import { Activity } from 'lucide-react';

const PlayerStats = () => {
  const stats = {
    wpm: 75,
    accuracy: 98,
    position: 2,
  };

  return (
    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-lg">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2" />
        Your Stats
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="text-sm text-gray-400">WPM</div>
          <div className="text-2xl font-bold">{stats.wpm}</div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Accuracy</div>
          <div className="text-2xl font-bold">{stats.accuracy}%</div>
        </div>
        <div className="col-span-2 bg-white/5 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Position</div>
          <div className="text-2xl font-bold">#{stats.position}</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;