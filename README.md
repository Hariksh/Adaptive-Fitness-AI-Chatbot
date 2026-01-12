# Adaptive Fitness AI Chatbot

![Status](https://img.shields.io/badge/Status-Completed-success)
![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Gemini-blue)

A smart, personality-adaptive fitness companion that grows with you. This application uses Google's Gemini AI to provide personalized fitness coaching based on user personality, usage duration, and lifestyle data.

## Download APK

You can download the Android APK directly from this repository:

- [Download APK (Direct)](https://expo.dev/artifacts/eas/mZv6p1KxgTwffm9p8k2QXP.apk)
- [View Build on Expo](https://expo.dev/accounts/hariksh07/projects/adaptive-fitness-ai-chatbot/builds/b5df592e-cd75-40dc-875d-be48df8c48dd)

Place the `AdaptiveFitnessAI.apk` file in the `apk/` folder (or replace the placeholder there) so the above link works, or attach the APK to a GitHub Release for distribution.

---

## Demo Video
[Watch Project Demo](https://drive.google.com/file/d/1lKJA_UK636u6SaMxn6mCx1Yxn0LDnoUz/view?usp=sharing)

---

## Key Features

### 1. Adaptive AI Personality Engine
The core of the application is an AI that shifts its tone based on your personality type:
-   **Type A (The Encouragement Seeker):** Warm, supportive, and positive coaching.
-   **Type B (The Creative Explorer):** Fun, unconventional, and adventurous advice.
-   **Type C (The Goal Finisher):** Direct, efficient, and no-nonsense guidance.

### 2. Usage Duration Logic
The AI adapts its coaching style based on how long you've been using the app:
-   **New User (< 3 days):** Empathetic and grounded onboarding.
-   **Week 1 (< 8 days):** Friendly listening and habit building.
-   **Regular User (> 8 days):** Seasoned coaching and advanced tips.

### 3. Customizable Profile & Context Injection
Users can update their **Age, Height, Weight**, and **Fitness Goal** directly in the app. The AI automatically reads this updated profile before every response to provide age-appropriate and goal-specific advice.

### 4. Lifestyle Integration (Dummy Data)
Demonstrates the ability to use context from wearables by injecting dummy data into the AI context:
-   **Steps**: Tracks daily movement.
-   **Exercise**: Monitors workout minutes.
-   **Sleep**: Considers rest for recovery advice.
*Note: This data is currently mocked for demonstration purposes.*

### 5. Safety Guardrails & RAG-lite
-   **Medical Safety:** The AI is strictly instructed to refuse providing medical diagnoses or advice on injuries.
-   **Knowledge Base:** Uses a "RAG-lite" approach (Retrieval Augmented Generation) to inject verified fitness facts into the system prompt for accurate answers.

---

## AI Implementation Details

This section details the Prompt Engineering and Logic used to drive the adaptive behavior.

### Prompt Composition Strategy
The system prompt is dynamically assembled in `backend/services/geminiService.js` before every API call. It combines:
1.  **Personality System Instruction** (selected based on user profile).
2.  **Duration Instruction** (selected based on signup date).
3.  **Knowledge Context** (injected `knowledgeBase.js` data).
4.  **User Profile & Dummy Lifestyle Data**.

### Usage Logic
-   **Core Logic**: `if (usageDays <= 3) ... else if (usageDays <= 8) ...`
-   **Effect**: Ensures new users aren't overwhelmed, while regular users get efficient advice.

### Safety Refusal Handling
The System Prompt includes strict negative constraints:
-   "Do NOT provide medical diagnosis."
-   "If they ask about medical/injury, Say: 'I cannot give medical advice. Please see a doctor.'"

### AI Tools Used
-   **Model**: Google Gemini `gemini-2.5-flash`
-   **SDK**: `@google/generative-ai`

---

## Tech Stack

-   **Frontend:** React Native (Expo)
-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB
-   **AI Engine:** Google Gemini API (`gemini-2.5-flash`)

---

## Prerequisites

Before running the project, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v14 or higher)
-   [npm](https://www.npmjs.com/)
-   [Expo Go](https://expo.dev/client) app on your physical device (Android/iOS) or an Emulator.
-   **MongoDB Connection URI** (Local or Atlas)
-   **Google Gemini API Key**

---

## Installation & Setup

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_API_KEY_2=optional_backup_key
```

Start the backend server:

```bash
npm start
# or for development with auto-restart:
npm run dev
```

### 2. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Start the Expo development server:

```bash
npm start
```

-   Scan the QR code with the **Expo Go** app on your phone.
-   Press `a` to run on Android Emulator or `i` to run on iOS Simulator (if configured).

---

## API Endpoints

The backend provides the following RESTful API routes:

| Route | Description |
| :--- | :--- |
| **`/api/auth`** | User registration and login. |
| **`/api/chat`** | Interactions with the Gemini AI coach. |
| **`/api/workouts`** | Logging and retrieving workout data. |
| **`/api/meals`** | Logging nutrition and calories. |
| **`/api/weight`** | Tracking weight progress. |

---

## Project Structure

```
Adaptive-Fitness-AI-Chatbot/
├── backend/             # Node.js/Express Server
│   ├── controllers/     # Route logic
│   ├── models/          # Mongoose Schemas
│   ├── routes/          # API Endpoints
│   ├── services/        # Gemini AI Integration
│   └── server.js        # Entry point
├── frontend/            # React Native Expo App
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── screens/     # App screens (Chat, Profile, etc.)
│   │   └── navigation/  # App navigation setup
│   └── App.js           # Entry point
├── AI_README.md         # Detailed AI prompt engineering docs
└── README.md            # Main documentation
```
