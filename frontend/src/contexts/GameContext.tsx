import { createContext, useContext, useState, ReactNode } from 'react';
import { Game, Player } from '../types/game';

interface GameContextType {
  currentGame: Game | null;
  players: Player[];
  gameState: 'waiting' | 'playing' | 'finished';
  timeLeft: number;
  setGameState: (state: 'waiting' | 'playing' | 'finished') => void;
  startGame: () => void;
  endGame: () => void;
  updatePlayerProgress: (playerId: string, progress: number, wpm: number, accuracy: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [timeLeft, setTimeLeft] = useState(60);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(60);
  };

  const endGame = () => {
    setGameState('finished');
  };

  const updatePlayerProgress = (playerId: string, progress: number, wpm: number, accuracy: number) => {
    setPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, progress, wpm, accuracy }
          : player
      )
    );
  };

  return (
    <GameContext.Provider value={{
      currentGame,
      players,
      gameState,
      timeLeft,
      setGameState,
      startGame,
      endGame,
      updatePlayerProgress
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 