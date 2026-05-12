const express = require('express');
const router = express.Router();
const waterController = require('../controllers/waterController');
const { authenticateToken } = require('../middleware/auth');

router.get('/today', authenticateToken, waterController.getWaterLogs);
router.post('/add', authenticateToken, waterController.updateWater);
router.post('/set', authenticateToken, waterController.setWater);

module.exports = router;
