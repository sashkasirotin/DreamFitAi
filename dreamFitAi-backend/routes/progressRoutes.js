const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticateToken } = require('../middleware/auth');

const { upload } = require('../services/cloudinary');

router.get('/', authenticateToken, progressController.getProgress);
router.post('/', authenticateToken, upload.single('image'), progressController.addProgress);
router.delete('/last', authenticateToken, progressController.deleteLastProgress);
router.delete('/:id', authenticateToken, progressController.deleteProgress);

module.exports = router;
