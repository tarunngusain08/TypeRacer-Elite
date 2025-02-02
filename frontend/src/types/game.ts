export interface Game {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  text: string;
  players: Player[];
  replayData: GameEvent[];
}

export interface Player {
  id: string;
  name: string;
  progress: number;
  wpm: number;
  accuracy: number;
}

export interface GameEvent {
  timestamp: string;
  playerId: string;
  type: string;
  data: any;
} 