import { useEffect, useState } from 'react';

const GameTitle = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isHovered) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  return (
    <h1 
      className="relative text-3xl font-bold"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={`
        bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 
        bg-[length:200%_100%] animate-shimmer inline-block transition-transform duration-300
        ${isAnimating ? 'scale-110' : 'scale-100'}
      `}>
        TypeRacer Elite
      </span>
      <div className={`
        absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 opacity-30 blur-lg
        transition-all duration-300
        ${isHovered ? 'animate-pulse-glow scale-110' : 'scale-100'}
      `} />
      {isHovered && (
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg animate-pulse-scale" />
      )}
    </h1>
  );
};

export default GameTitle; 