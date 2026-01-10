const Chat = require("../models/Chat");
const geminiService = require("../services/geminiService");
const Workout = require("../models/Workout");

exports.chat = async (req, res) => {
    try {
        const { message, userContext } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        // Retrieve userId from authenticated request (if available via middleware)
        // Note: Currently chatRoutes receives userContext from frontend, but we should rely on req.user if authMiddleware is used.
        // For now, checks if req.user exists (added by authMiddleware).
        let recentWorkouts = [];
        if (req.user && req.user.userId) {
            recentWorkouts = await Workout.find({ userId: req.user.userId })
                .sort({ date: -1 })
                .limit(3);
        }

        // Attach workouts to context
        const enhancedContext = { ...userContext, recentWorkouts };

        Chat.create({ role: "user", content: message, userContext: enhancedContext }).catch(err => console.error("DB Save Error:", err.message));

        const aiResponse = await geminiService.generateResponse(message, enhancedContext);

        Chat.create({ role: "ai", content: aiResponse, userContext: enhancedContext }).catch(err => console.error("DB Save Error:", err.message));

        res.json({ response: aiResponse, type: "text" });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
