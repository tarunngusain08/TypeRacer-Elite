import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface GameInterfaceProps {
  gameId: string;
  onComplete: (wpm: number, accuracy: number) => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ gameId, onComplete }) => {
  const [input, setInput] = useState('');
  const [wpm, setWpm] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const sampleText = "The quick brown fox jumps over the lazy dog. As the sun sets behind the mountains, casting long shadows across the valley, a gentle breeze rustles through the leaves.";

  // Initialize our websocket for the game only if gameId is set.
  const { isConnected, sendMessage } = useWebSocket(gameId);

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
    
    // When user types, if we have an open websocket connection, send a progress update.
    if (isConnected && gameId) {
      const progress = (input.length / sampleText.length) * 100;
      // For demo purposes, we use a hardcoded playerID ("test-player")
      sendMessage("progress", {
        playerId: "test-player",
        progress,
        wpm,
        accuracy: input.length > 0 
          ? Math.round(
              (input.split('').filter((char, i) => char === sampleText[i]).length / input.length) * 100
            )
          : 0
      });
    }

    // Check if the user has completed typing the sample text.
    if (input.length === sampleText.length) {
      const accuracy = Math.round(
        (input.split('').filter((char, i) => char === sampleText[i]).length / input.length) * 100
      );
      onComplete(wpm, accuracy);
    }
  }, [input, startTime, sampleText, wpm, isConnected, sendMessage, gameId, onComplete]);

  const accuracy = input.length > 0
    ? Math.round(
        (input.split('').filter((char, i) => char === sampleText[i]).length / input.length) * 100
      )
    : 0;

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
          <span className="text-sm ml-2">Accuracy</span>
        </div>
      </div>
      {/* Input Field */}
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700/50 text-white text-lg"
          placeholder="Start typing here..."
        />
      </div>
    </div>
  );
};

export default GameInterface;
