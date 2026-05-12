const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { authenticateToken } = require('../middleware/auth');

router.post('/generate', authenticateToken, storyController.generateFitnessStory);

module.exports = router;
