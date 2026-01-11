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


        // Calculate Usage Duration (Days since registration)
        let usageDays = 0;
        if (profile && profile.createdAt) {
            const now = new Date();
            const created = new Date(profile.createdAt);
            const diffTime = Math.abs(now - created);
            usageDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Attach to context
        const enhancedContext = {
            ...userContext,
            recentWorkouts,
            profile,
            todaysMeals,
            usageDays // Override frontend value with server-side truth
        };

        Chat.create({ role: "user", content: message, userContext: enhancedContext }).catch(err => console.error("DB Save Error:", err.message));

        const aiResponse = await geminiService.generateResponse(message, enhancedContext);

        Chat.create({ role: "ai", content: aiResponse, userContext: enhancedContext }).catch(err => console.error("DB Save Error:", err.message));

        // Award Coin
        if (req.user && req.user.userId) {
            await User.findByIdAndUpdate(req.user.userId, { $inc: { coins: 1 } });
        }

        res.json({ response: aiResponse, type: "text" });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getHistory = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const history = await Chat.find({ "userContext.profile._id": req.user.userId })
            .sort({ timestamp: -1 })
            .limit(50);

        // Group by conversation session roughly (for now just returning flat list)
        res.json(history);
    } catch (error) {
        console.error("Get History Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
