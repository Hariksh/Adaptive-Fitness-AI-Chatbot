const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, workoutController.logWorkout);
router.get('/', authenticateToken, workoutController.getWorkouts);

module.exports = router;
