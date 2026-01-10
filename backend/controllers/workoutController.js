const Workout = require('../models/Workout');

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
