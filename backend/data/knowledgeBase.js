// Trusted Fitness Knowledge Base for RAG-lite
// This data is injected into the AI context to ensure accurate, trusted answers.

const fitnessKnowledge = {
    nutrition: [
        {
            topic: "Protein Intake",
            fact: "General recommendation is 1.6g to 2.2g of protein per kg of body weight for muscle building."
        },
        {
            topic: "Creatine",
            fact: "Creatine Monohydrate is the most researched supplement. 5g daily is standard. It helps with power output and muscle hydration."
        },
        {
            topic: "Weight Loss",
            fact: "Caloric deficit is the primary driver of weight loss. Aim for a 300-500 calorie deficit below TDEE."
        }
    ],
    workouts: [
        {
            topic: "Rest Days",
            fact: "Muscles grow during rest, not during the workout. At least 1-2 rest days per week are recommended."
        },
        {
            topic: "Progressive Overload",
            fact: "To build muscle, you must gradually increase the weight, frequency, or number of repetitions in your strength training routine."
        }
    ],
    safety: [
        {
            topic: "Pain",
            fact: "Sharp pain is a bad sign. Stop immediately. Delayed Onset Muscle Soreness (DOMS) is normal 24-48 hours after a workout."
        }
    ]
};

module.exports = fitnessKnowledge;
