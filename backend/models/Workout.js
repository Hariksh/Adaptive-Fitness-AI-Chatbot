const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activityType: {
        type: String,
        required: true, // e.g., "Running", "Gym", "Yoga"
    },
    duration: {
        type: Number, // in minutes
    },
    caloriesBurned: {
        type: Number,
    },
    notes: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Workout', workoutSchema);
