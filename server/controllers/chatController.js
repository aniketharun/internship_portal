const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Get all chats for current user
// @route   GET /api/chats
// @access  Private
exports.getChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id
        })
            .populate('participants', 'name email profilePicture role')
            .sort('-updatedAt');

        res.status(200).json({
            success: true,
            data: chats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get messages for a chat
// @route   GET /api/chats/:chatId/messages
// @access  Private
exports.getMessages = async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return next(new AppError('Chat not found', 404));
        }

        if (!chat.participants.includes(req.user._id)) {
            return next(new AppError('Not authorized to access this chat', 403));
        }

        const messages = await Message.find({ chat: req.params.chatId }).sort('createdAt');

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send a message / Create chat
// @route   POST /api/chats/message
// @access  Private
exports.sendMessage = async (req, res, next) => {
    try {
        const { recipientId, text } = req.body;

        if (!recipientId || !text) {
            return next(new AppError('Please provide recipient and message text', 400));
        }

        // Find or Create Chat
        let chat = await Chat.findOne({
            participants: { $all: [req.user._id, recipientId] }
        });

        if (!chat) {
            chat = await Chat.create({
                participants: [req.user._id, recipientId]
            });
        }

        const message = await Message.create({
            chat: chat._id,
            sender: req.user._id,
            text
        });

        // Update Chat metadata
        chat.lastMessage = {
            text,
            sender: req.user._id,
            createdAt: new Date()
        };

        // Update unread counts for recipient
        const currentUnread = chat.unreadCount.get(recipientId.toString()) || 0;
        chat.unreadCount.set(recipientId.toString(), currentUnread + 1);

        await chat.save();

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark chat as read
// @route   PUT /api/chats/:chatId/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return next(new AppError('Chat not found', 404));
        }

        if (chat.unreadCount) {
            chat.unreadCount.set(req.user._id.toString(), 0);
            await chat.save();
        }

        await Message.updateMany(
            { chat: req.params.chatId, sender: { $ne: req.user._id } },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
