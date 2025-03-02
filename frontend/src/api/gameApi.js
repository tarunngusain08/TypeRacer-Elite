
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/games';

// Create new game progress
export const createNewProgress = async (progressData) => {
  try {
    const response = await axios.post(`${API_URL}/new/progress`, progressData);
    return response.data;
  } catch (error) {
    console.error('Error creating new progress:', error);
    throw error;
  }
};

// Get all games
export const getAllGames = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};