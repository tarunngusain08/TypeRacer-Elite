import React, { useState, useEffect } from 'react';
import { gameApi } from '../../services/api';

interface GameInterfaceProps {
  gameId: string;
  playerId: string;
  onComplete: (wpm: number, accuracy: number) => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ gameId, playerId, onComplete }) => {
  const [input, setInput] = useState('');
  const [wpm, setWpm] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const sampleText = "The quick brown fox jumps over the lazy dog. As the sun sets behind the mountains, casting long shadows across the valley, a gentle breeze rustles through the leaves.";
  
  useEffect(() => {
    if (input.length === 1) {
      setStartTime(Date.now());
    }
    
    if (startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const wordsTyped = input.length / 5; // assuming average word length of 5 characters
      const currentWpm = Math.round(wordsTyped / timeElapsed);
      setWpm(currentWpm || 0);
    }

    // Check if the user has completed the text
    if (input.length === sampleText.length) {
      const accuracy = Math.round(
        (input.split('').filter((char, i) => char === sampleText[i]).length /
          input.length) *
          100
      );
      onComplete(wpm, accuracy);
    }

    // Send progress updates periodically
    const interval = setInterval(() => {
      if (gameId && progress < 100) {
        gameApi.updateProgress(gameId, {
          playerId,
          progress,
          wpm: calculateWPM(),
          accuracy: calculateAccuracy()
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [input, startTime, sampleText, wpm, onComplete, gameId, playerId, progress]);

  const accuracy = input.length > 0
    ? Math.round(
        (input.split('').filter((char, i) => char === sampleText[i]).length /
          input.length) *
          100
      )
    : 0;

  const calculateWPM = () => {
    if (startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const wordsTyped = input.length / 5; // assuming average word length of 5 characters
      return Math.round(wordsTyped / timeElapsed);
    }
    return 0;
  };

  const calculateAccuracy = () => {
    if (input.length > 0 && sampleText.length > 0) {
      return Math.round(
        (input.split('').filter((char, i) => char === sampleText[i]).length /
          input.length) *
          100
      );
    }
    return 0;
  };

  return (
    <div className="space-y-8">
      {/* Text to Type */}
      <div className="bg-gray-800/30 rounded-xl p-6 font-mono text-lg leading-relaxed border border-gray-700/50">
        {sampleText.split('').map((char, index) => (
          <span
            key={index}
            className={
              input[index] === undefined
                ? 'text-gray-500'
                : input[index] === char
                ? 'text-green-400'
                : 'text-red-400'
            }
          >
            {char}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center bg-gray-800/30 rounded-lg p-4">
        <div className="text-purple-400">
          <span className="font-mono text-xl">{wpm}</span>
          <span className="text-sm ml-2">WPM</span>
        </div>
        <div className="text-pink-400">
          <span className="font-mono text-xl">{accuracy}</span>
          <span className="text-sm ml-2">% Accuracy</span>
        </div>
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full bg-gray-800/30 rounded-xl p-6 font-mono text-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent placeholder-gray-600"
        placeholder="Start typing when the race begins..."
        autoFocus
      />

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 relative"
            style={{ width: `${(input.length / sampleText.length) * 100}%` }}
          >
            <div className="absolute -top-8 right-0 transform translate-x-1/2">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop"
                alt="Player"
                className="w-6 h-6 rounded-full border-2 border-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInterface;