# AI Architecture & Prompt Engineering

This document details the Artificial Intelligence architecture used in the Adaptive Fitness Chatbot. The system leverages Google's **Gemini 2.5 Flash** model, orchestrated via a Node.js backend.

## 1. Core Architecture

The AI layer is built on the `GoogleGenerativeAI` SDK. It features a custom **Context Injection System** that dynamically assembles the System Prompt based on real-time user data.

-   **Model**: `gemini-2.5-flash`
-   **Temperature**: Default (Balanced for creativity and accuracy)
-   **Failover Strategy**: Implements API Key rotation to handle rate limits (Error 429) or disabled keys.

## 2. Dynamic Context Injection

The prompt is not static. Before every API call, the system constructs a unique `System Prompt` using the following components:

### A. Personality Injection
The system selects one of three distinct system instructions based on the user's selected personality type:

| Personality Type | System Instruction |
| :--- | :--- |
| **Type A (Encouragement Seeker)** | "You are an 'Encouragement Seeker' coach. Be supportive and positive." |
| **Type B (Creative Explorer)** | "You are a 'Creative Explorer' coach. Be fun and unconventional." |
| **Type C (Goal Finisher)** | "You are a 'Goal Finisher' coach. Be direct and efficient." |

### B. Temporal Adaptation
The AI changes its onboarding approach based on the User's `usageDuration`:

-   **New User (< 3 days)**: "Be empathetic and grounded."
-   **Week 1 (< 8 days)**: "Be a friendly listener (Week 1)."
-   **Regular User (> 8 days)**: "Act like a seasoned coach."

### C. Lifestyle Data (Mocked)
To simulate wearable integration, the backend injects "Dummy Data" into the context block. This allows the AI to give specific advice even without real sensors.

```text
LIFESTYLE CONTEXT (Dummy Data):
- Steps: 4200
- Exercise: 25 mins
- Sleep: 5.5 hours
```

## 3. Knowledge Retrieval (RAG-lite)

The system utilizes a lightweight Retrieval-Augmented Generation (RAG) approach. A verified `knowledgeBase.js` object containing key fitness facts is serialized and injected directly into the prompt.

**Instruction to AI:**
> "YOUR TRUSTED KNOWLEDGE BASE (Prioritize this over general training)"

This ensures the AI prioritizes our verified facts over its general training data when answering specific questions (e.g., about creatine or protein intake).

## 4. Safety Guardrails

To ensure user safety and legal compliance, the system prompt includes strict negative constraints:

1.  **No Medical Diagnosis**: The AI is explicitly forbidden from diagnosing conditions.
2.  **Medical Referral**: If a user asks about injury or pain, the AI must reply: *"I cannot give medical advice. Please see a doctor."*

## 5. System Prompt Template

The final prompt assembly looks like this (simplified representation):

```javascript
`
You are an adaptive fitness coach.

${personalityInstruction}
${durationInstruction}

YOUR TRUSTED KNOWLEDGE BASE (Prioritize this over general training):
${knowledgeContext}

USER PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}
- Goal: ${profile.fitnessGoal}

LIFESTYLE CONTEXT (Dummy Data):
- Steps: ${lifestyleContext.steps}
- Exercise: ${lifestyleContext.exerciseMinutes} mins
- Sleep: ${lifestyleContext.sleepHours} hours

INSTRUCTIONS:
1. Use the Knowledge Base to answer specific questions.
2. Be short and encouraging.
3. If they ask about medical/injury, Say: "I cannot give medical advice. Please see a doctor."
4. Do NOT provide medical diagnosis.
`
```

## 6. Implementation

-   **File**: `backend/services/geminiService.js`
-   **Function**: `getSystemPrompt(userContext)` constructs the string.
-   **Execution**: `model.generateContent(fullPrompt)` sends the request.
