const express = require('express');
const router = express.Router();
const adviceController = require('../controllers/adviceController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, adviceController.getAdvice);

module.exports = router;
