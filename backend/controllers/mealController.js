const User = require('../models/User');
const Meal = require('../models/Meal');

exports.logMeal = async (req, res) => {
    try {
        const { name, calories, type, protein, carbs, fats } = req.body;

        const meal = await Meal.create({
            userId: req.user.userId,
            name,
            calories,
            type,
            protein,
            carbs,
            fats
        });

        if (req.user && req.user.userId) {
            await User.findByIdAndUpdate(req.user.userId, { $inc: { coins: 2 } });
        }

        res.json(meal);
    } catch (error) {
        console.error("Log Meal Error:", error);
        res.status(500).json({ error: "Failed to log meal" });
    }
};

exports.getMeals = async (req, res) => {
    try {
        // Get meals for the current day (server time logic, simple for now)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const meals = await Meal.find({
            userId: req.user.userId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        res.json(meals);
    } catch (error) {
        console.error("Get Meals Error:", error);
        res.status(500).json({ error: "Failed to fetch meals" });
    }
};

exports.updateMeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, calories, type } = req.body;

        const updatedMeal = await Meal.findOneAndUpdate(
            { _id: id, userId: req.user.userId },
            { name, calories, type },
            { new: true }
        );

        if (!updatedMeal) {
            return res.status(404).json({ error: "Meal not found" });
        }

        res.json(updatedMeal);
    } catch (error) {
        console.error("Update Meal Error:", error);
        res.status(500).json({ error: "Failed to update meal" });
    }
};
