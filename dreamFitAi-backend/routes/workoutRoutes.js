const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, workoutController.getWorkouts);
router.post('/', authenticateToken, workoutController.addWorkout);
router.delete('/last', authenticateToken, workoutController.deleteLastWorkout);

module.exports = router;
