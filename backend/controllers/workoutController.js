const User = require('../models/User');
const Workout = require('../models/Workout');
const mongoose = require('mongoose');

exports.logWorkout = async (req, res) => {
    try {
        const { activityType, duration, caloriesBurned, notes } = req.body;

        const workout = await Workout.create({
            userId: req.user.userId,
            activityType,
            duration,
            caloriesBurned,
            notes
        });

        if (req.user && req.user.userId) {
            await User.findByIdAndUpdate(req.user.userId, { $inc: { coins: 5 } });
        }

        res.json(workout);
    } catch (error) {
        console.error("Log Workout Error:", error);
        res.status(500).json({ error: "Failed to log workout" });
    }
};

exports.getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({ userId: req.user.userId }).sort({ date: -1 });
        res.json(workouts);
    } catch (error) {
        console.error("Get Workouts Error:", error);
        res.status(500).json({ error: "Failed to fetch workouts" });
    }
};

exports.getWorkoutStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Aggregate by activity type
        const stats = await Workout.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: "$activityType",
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalWorkouts = stats.reduce((acc, curr) => acc + curr.count, 0);

        // Format for frontend: labels and data
        // Only take top 3 types for simple chart, or all
        const formattedStats = stats.map(item => ({
            label: item._id,
            count: item.count,
            percentage: totalWorkouts > 0 ? (item.count / totalWorkouts) : 0
        }));

        res.json({
            total: totalWorkouts,
            breakdown: formattedStats
        });

    } catch (error) {
        console.error("Get Workout Stats Error:", error);
        res.status(500).json({ error: "Failed to fetch workout stats" });
    }
};
