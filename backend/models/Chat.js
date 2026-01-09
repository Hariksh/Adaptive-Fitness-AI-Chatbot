const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'ai', 'system']
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
