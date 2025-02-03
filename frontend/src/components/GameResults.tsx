import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GameResultsProps {
  wpm: number;
  accuracy: number;
  position?: number;
  onPlayAgain: () => void;
}

const GameResults = ({ wpm, accuracy, position, onPlayAgain }: GameResultsProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="inline-block"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-2">Race Complete!</h2>
        <p className="text-gray-400">Here's how you performed</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <motion.div
          className="bg-gray-700/50 rounded-lg p-6 text-center"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-3xl font-bold mb-1">{wpm}</div>
          <div className="text-gray-400 text-sm">Words per Minute</div>
        </motion.div>

        <motion.div
          className="bg-gray-700/50 rounded-lg p-6 text-center"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-3xl font-bold mb-1">{accuracy}%</div>
          <div className="text-gray-400 text-sm">Accuracy</div>
        </motion.div>
      </div>

      <div className="flex justify-center space-x-4">
        <motion.button
          onClick={onPlayAgain}
          className="px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-500 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Play Again
        </motion.button>
        
        <motion.button
          onClick={() => navigate('/leaderboard')}
          className="px-6 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View Leaderboard
        </motion.button>
      </div>
    </motion.div>
  );
};

export default GameResults; 