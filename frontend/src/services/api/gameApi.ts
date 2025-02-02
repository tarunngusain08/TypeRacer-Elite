import { apiClient } from './apiClient';
import { Game, Player } from '../../types/game';

export const gameApi = {
  create: (text: string) => 
    apiClient.post<Game>('/games', { text }),

  join: (gameId: string, player: Pick<Player, 'id' | 'name'>) =>
    apiClient.post<Game>(`/games/${gameId}/join`, player),

  updateProgress: (gameId: string, progress: {
    playerId: string;
    progress: number;
    wpm: number;
    accuracy: number;
  }) =>
    apiClient.post(`/games/${gameId}/progress`, progress),

  getGame: (gameId: string) =>
    apiClient.get<Game>(`/games/${gameId}`),

  getActiveGames: () =>
    apiClient.get<Game[]>('/games')
}; 