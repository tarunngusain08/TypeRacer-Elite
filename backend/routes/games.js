const express = require('express');
const router = express.Router();
const GameController = require('../controllers/GameController');

// ...existing code...

// Route to create new game progress
router.post('/new/progress', GameController.createNewProgress);

// Route to get all games
router.get('/', GameController.getAllGames);

// ...existing code...

module.exports = router;
