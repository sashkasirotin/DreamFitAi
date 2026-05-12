const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const { authenticateToken } = require('../middleware/auth');

const { upload } = require('../services/cloudinary');

router.get('/', authenticateToken, mealController.getMeals);
router.post('/', authenticateToken, upload.single('image'), mealController.addMeal);
router.post('/analyze', authenticateToken, mealController.analyzeMeal);

module.exports = router;
