require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const Chat = require("./models/Chat");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));

// --- Intelligent API Key Manager (Gemini Edition) ---
const apiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2
].filter(key => key); // Filter out undefined keys

let currentKeyIndex = 0;
let genAI = null;
let model = null;

const initializeGemini = () => {
    if (apiKeys.length === 0) {
        console.error("CRITICAL: No Gemini API Keys found!");
        return;
    }
    const activeKey = apiKeys[currentKeyIndex];
    genAI = new GoogleGenerativeAI(activeKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log(`API Key Monitor: Initialized with Key Index [${currentKeyIndex}] (End: ...${activeKey.slice(-4)})`);
};

// Initial Setup
initializeGemini();

const rotateApiKey = () => {
    if (apiKeys.length <= 1) {
        console.warn("API Key Monitor: No backup keys available for rotation.");
        return false;
    }

    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    const activeKey = apiKeys[currentKeyIndex];
    genAI = new GoogleGenerativeAI(activeKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.warn(`API Key Monitor: Switched to Backup Key Index [${currentKeyIndex}] (End: ...${activeKey.slice(-4)})`);
    return true;
};

// --- System Prompt Helper ---
function getSystemPrompt(userContext = {}) {
    const { personality, usageDays } = userContext;

    let personalityInstruction = "You are a helpful fitness coach.";
    if (personality === 'A') personalityInstruction = "You are an 'Encouragement Seeker' coach. Be supportive and positive.";
    if (personality === 'B') personalityInstruction = "You are a 'Creative Explorer' coach. Be fun and unconventional.";
    if (personality === 'C') personalityInstruction = "You are a 'Goal Finisher' coach. Be direct and efficient.";

    let durationInstruction = "Be helpful.";
    if (usageDays <= 3) durationInstruction = "Be empathetic and grounded (New User).";
    else if (usageDays <= 8) durationInstruction = "Be a friendly listener (Week 1).";
    else durationInstruction = "Act like a seasoned coach (Regular User).";

    return `
${personalityInstruction}
${durationInstruction}

User context: ${JSON.stringify(userContext)}
Do NOT provide medical diagnosis.
`;
}

// --- Routes ---
app.get("/", (req, res) => {
    res.json({ status: "Server is running (Gemini AI Manager Active)" });
});

app.post("/api/chat", async (req, res) => {
    try {
        if (!model) return res.status(500).json({ error: "Gemini not initialized" });

        const { message, userContext } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        const systemPrompt = getSystemPrompt(userContext);
        const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}`;

        // Save User Message (Async)
        Chat.create({ role: "user", content: message, userContext }).catch(err => console.error("DB Save Error:", err.message));

        let aiResponse = "";
        let attempt = 0;
        const maxAttempts = apiKeys.length + 1;
        let success = false;

        // --- Robust Retry Loop with Key Rotation ---
        while (attempt < maxAttempts && !success) {
            try {
                attempt++;
                const result = await model.generateContent(fullPrompt);
                aiResponse = result.response.text();
                success = true; // Success!

            } catch (aiError) {
                console.error(`API Call Failed (Attempt ${attempt}/${maxAttempts}):`, aiError.message);

                // Gemini Specific Errors: 
                // 429 = Quota Exceeded
                // 404 = "User has not enabled the API"
                const isRateLimit = aiError.message?.includes("429") || aiError.status === 429;
                const isNotEnabled = aiError.message?.includes("404") || aiError.message?.includes("not enabled");

                if (isRateLimit || isNotEnabled) {
                    console.warn(`⚠️ API Issue (${isRateLimit ? 'Rate Limit' : 'Not Enabled'}) on Key [${currentKeyIndex}]. Initiating Failover...`);

                    const rotated = rotateApiKey();
                    if (!rotated) {
                        aiResponse = "Sorry, all my API keys are currently busy or not enabled. Please check the Google Cloud Console.";
                        success = true;
                    }
                } else {
                    aiResponse = "Sorry, I am having trouble connecting to Google Gemini right now.";
                    success = true;
                }
            }
        }

        if (!aiResponse) {
            aiResponse = "Sorry, I’m taking a short break. Please check your API credits/permissions.";
        }

        // Save AI Response
        Chat.create({ role: "ai", content: aiResponse, userContext }).catch(err => console.error("DB Save Error:", err.message));

        res.json({ response: aiResponse, type: "text" });

    } catch (error) {
        console.error("Critical Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🛡️  Gemini API Manager: Active (${apiKeys.length} keys loaded)`);
});
