import { useEffect, useState } from 'react';
import { Timer, Zap, Target } from 'lucide-react';

interface GameStateTransitionProps {
  from: string;
  to: string;
  onComplete: () => void;
}

const GameStateTransition = ({ from, to, onComplete }: GameStateTransitionProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 300); // Wait for exit animation
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`
      fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50
      transition-opacity duration-300
      ${show ? 'opacity-100' : 'opacity-0'}
    `}>
      <div className="space-y-6 text-center">
        <div className="flex items-center justify-center space-x-4">
          <div className="w-16 h-16 relative animate-spin-slow">
            {from === 'waiting' && <Timer className="w-16 h-16 text-purple-500" />}
            {from === 'playing' && <Zap className="w-16 h-16 text-pink-500" />}
            {from === 'finished' && <Target className="w-16 h-16 text-green-500" />}
          </div>
          <div className="text-3xl font-bold animate-pulse-scale">→</div>
          <div className="w-16 h-16 relative animate-bounce-in">
            {to === 'playing' && <Zap className="w-16 h-16 text-pink-500" />}
            {to === 'finished' && <Target className="w-16 h-16 text-green-500" />}
            {to === 'waiting' && <Timer className="w-16 h-16 text-purple-500" />}
          </div>
        </div>
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 animate-shimmer">
          {to === 'playing' && 'Get Ready to Type!'}
          {to === 'finished' && 'Race Complete!'}
          {to === 'waiting' && 'Back to Lobby'}
        </div>
      </div>
    </div>
  );
};

export default GameStateTransition; 