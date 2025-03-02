
const Game = require('../models/Game');

// Create new game progress
exports.createNewProgress = async (req, res) => {
  try {
    const newProgress = new Game(req.body);
    await newProgress.save();
    res.status(201).json(newProgress);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Get all games
exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.status(200).json(games);
  } catch (error) {
    res.status(404).json({ message: 'Games not found', error });
  }
};