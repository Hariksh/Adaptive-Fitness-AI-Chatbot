const express = require('express');
const router = express.Router();
const weightController = require('../controllers/weightController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, weightController.logWeight);
router.get('/', authMiddleware, weightController.getWeightHistory);

module.exports = router;
