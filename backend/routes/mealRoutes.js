const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, mealController.logMeal);
router.get('/', authenticateToken, mealController.getMeals);
router.put('/:id', authenticateToken, mealController.updateMeal);

module.exports = router;
