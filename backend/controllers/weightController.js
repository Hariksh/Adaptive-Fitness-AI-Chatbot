const WeightHistory = require('../models/WeightHistory');
const User = require('../models/User');

exports.logWeight = async (req, res) => {
    try {
        const { weight } = req.body;
        const userId = req.user.userId;

        // Create new history entry
        const entry = await WeightHistory.create({
            userId,
            weight
        });

        // Update user's current weight in profile
        await User.findByIdAndUpdate(userId, { weight });

        res.status(201).json(entry);
    } catch (error) {
        console.error("Log Weight Error:", error);
        res.status(500).json({ error: "Failed to log weight" });
    }
};

exports.getWeightHistory = async (req, res) => {
    try {
        const history = await WeightHistory.find({ userId: req.user.userId })
            .sort({ date: 1 }); // Oldest first for graph
        res.json(history);
    } catch (error) {
        console.error("Get Weight History Error:", error);
        res.status(500).json({ error: "Failed to fetch weight history" });
    }
};
