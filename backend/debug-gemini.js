require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        // There isn't a direct listModels method on the instance easily used here without looking up docs, 
        // but let's try to just run a simple prompt on a known fallback 'gemini-pro'.

        console.log("Testing gemini-2.5-flash...");
        try {
            const result = await model.generateContent("Hello?");
            console.log("Success with gemini-2.5-flash");
        } catch (e) {
            console.error("Failed with gemini-2.5-flash:", e.message);
        }

        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("Testing gemini-pro...");
        try {
            const result = await modelPro.generateContent("Hello?");
            console.log("Success with gemini-pro");
        } catch (e) {
            console.error("Failed with gemini-pro:", e.message);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
