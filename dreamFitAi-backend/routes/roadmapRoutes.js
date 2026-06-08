const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { authenticateToken } = require('../middleware/auth');

router.get('/latest', authenticateToken, roadmapController.getLatestRoadmap);
router.post('/generate', authenticateToken, roadmapController.generateRoadmap);
router.post('/upgrade', authenticateToken, roadmapController.upgradeRoadmap);

module.exports = router;
