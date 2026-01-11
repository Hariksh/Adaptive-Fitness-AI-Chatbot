const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'ai', 'system']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for system messages, but required for user/ai chat
    },
    content: {
        type: String,
        required: true
    },
    userContext: {
        type: Object,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Chat', chatSchema);
