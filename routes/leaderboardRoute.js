const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { validateAdjust } = require('../validators/leaderboardValidator');
const auth = require('../middlewares/authMiddleware');

// Adjust User Score in Leaderboard
router.post('/adjust', auth, validateAdjust, leaderboardController.adjust);

// Get Top Users in Leaderboard
router.get('/top', leaderboardController.top);

// Get Current User's Score
router.get('/me', auth, leaderboardController.me);

module.exports = router;