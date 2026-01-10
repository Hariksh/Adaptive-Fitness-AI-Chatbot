const Chat = require("../models/Chat");
const geminiService = require("../services/geminiService");
const Workout = require("../models/Workout");
const User = require("../models/User");
const Meal = require("../models/Meal");

exports.chat = async (req, res) => {
    try {
        const { message, userContext } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        let recentWorkouts = [];
        let profile = null;
        let todaysMeals = [];

        if (req.user && req.user.userId) {
            // Fetch Profile
            profile = await User.findById(req.user.userId).select('-password');

            // Fetch Recent Workouts
            recentWorkouts = await Workout.find({ userId: req.user.userId })
                .sort({ date: -1 })
                .limit(3);

            // Fetch Today's Meals
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            todaysMeals = await Meal.find({
                userId: req.user.userId,
                date: { $gte: startOfDay, $lte: endOfDay }
            });
        }

        // Attach to context
        const enhancedContext = {
            ...userContext,
            recentWorkouts,
            profile,
            todaysMeals
        };

        Chat.create({ role: "user", content: message, userContext: enhancedContext }).catch(err => console.error("DB Save Error:", err.message));

        const aiResponse = await geminiService.generateResponse(message, enhancedContext);

        Chat.create({ role: "ai", content: aiResponse, userContext: enhancedContext }).catch(err => console.error("DB Save Error:", err.message));

        res.json({ response: aiResponse, type: "text" });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
