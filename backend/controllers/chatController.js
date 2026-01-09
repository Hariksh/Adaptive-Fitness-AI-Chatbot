const Chat = require("../models/Chat");
const geminiService = require("../services/geminiService");

exports.chat = async (req, res) => {
    try {
        const { message, userContext } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        Chat.create({ role: "user", content: message, userContext }).catch(err => console.error("DB Save Error:", err.message));

        const aiResponse = await geminiService.generateResponse(message, userContext);

        Chat.create({ role: "ai", content: aiResponse, userContext }).catch(err => console.error("DB Save Error:", err.message));

        res.json({ response: aiResponse, type: "text" });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
