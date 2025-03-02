
import React, { useEffect, useState } from 'react';
import { getAllGames } from '../api/gameApi';

// ...existing code...

const Leaderboard = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesData = await getAllGames();
        setGames(gamesData);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchGames();
  }, []);

  return (
    <div>
      <h1>Leaderboard</h1>
      <ul>
        {games.map((game) => (
          <li key={game._id}>{game.name} - {game.score}</li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;