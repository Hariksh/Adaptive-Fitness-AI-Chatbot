const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2
].filter(key => key);

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
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log(`API Key Monitor: Initialized with Key Index [${currentKeyIndex}] (End: ...${activeKey.slice(-4)})`);
};

initializeGemini();

const rotateApiKey = () => {
    if (apiKeys.length <= 1) {
        console.warn("API Key Monitor: No backup keys available for rotation.");
        return false;
    }

    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    const activeKey = apiKeys[currentKeyIndex];
    genAI = new GoogleGenerativeAI(activeKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.warn(`API Key Monitor: Switched to Backup Key Index [${currentKeyIndex}] (End: ...${activeKey.slice(-4)})`);
    return true;
};

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

exports.generateResponse = async (message, userContext) => {
    if (!model) throw new Error("Gemini not initialized");

    const systemPrompt = getSystemPrompt(userContext);
    const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}`;

    let aiResponse = "";
    let attempt = 0;
    const maxAttempts = apiKeys.length + 1;
    let success = false;

    while (attempt < maxAttempts && !success) {
        try {
            attempt++;
            const result = await model.generateContent(fullPrompt);
            aiResponse = result.response.text();
            success = true;

        } catch (aiError) {
            console.error(`API Call Failed (Attempt ${attempt}/${maxAttempts}):`, aiError.message);

            const isRateLimit = aiError.message?.includes("429") || aiError.status === 429;
            const isNotEnabled = aiError.message?.includes("404") || aiError.message?.includes("not enabled");

            if (isRateLimit || isNotEnabled) {
                console.warn(`API Issue (${isRateLimit ? 'Rate Limit' : 'Not Enabled'}) on Key [${currentKeyIndex}]. Initiating Failover...`);

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

    return aiResponse;
};
