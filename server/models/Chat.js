const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        lastMessage: {
            text: String,
            sender: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast lookup of candidate chats
chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);
