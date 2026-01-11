# 🏋️‍♂️ Adaptive Fitness AI Chatbot

**Status**: 🚀 Completed / Ready for Submission
**Tech Stack**: React Native (Expo), Node.js, Express, MongoDB, Google Gemini AI.

A smart, personality-adaptive fitness companion that grows with you. Adapted for the AI Internship Challenge.

---

## 🌟 Features

### 1. Adaptive AI (Core)
The AI changes behavior based on:
-   **Personality Type**: (A) Encouragement Seeker, (B) Creative Explorer, (C) Goal Finisher.
-   **Usage Duration**: Logic detects New Users (0-3 days) vs Veterans (9+ days).
-   **Lifestyle Context**: Uses **Dummy Data** (Steps, Sleep) to personalize advice (as per Requirement 5.3).

### 2. Mandatory Features
-   **Welcome Screen**: Clear intro and CTA.
-   **Chat Screen**: Interactive interface with loading states.
-   **Safety Guardrails**: Strictly refuses medical advice.
-   **Auth**: Login/Signup to track Usage Duration.

### 3. Bonus Enhancements
-   **Coin Rewards**: Earn coins for chatting.
-   **RAG-lite**: Injected trusted Knowledge Base for accurate answers.
-   **Chat History**: View past conversations.
-   **Theming**: Custom "Health Green" gradients.

---

## 🛠️ Tech Stack

-   **Frontend**: React Native (Expo).
-   **Backend**: Node.js, Express.js.
-   **Database**: MongoDB.
-   **AI**: Google Gemini API.

---

## 🚀 Setup

1.  **Backend**:
    ```bash
    cd backend
    npm install
    # Set GEMINI_API_KEY in .env
    npm start
    ```

2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm start
    ```

---

## 🤖 AI Compliance
See `AI_README.md` for full prompt details, including the exact Prompt Composition Strategy.
