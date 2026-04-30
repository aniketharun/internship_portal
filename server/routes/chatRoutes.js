const express = require('express');
const router = express.Router();
const {
    getChats,
    getMessages,
    sendMessage,
    markAsRead
} = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getChats);
router.post('/message', sendMessage);
router.get('/:chatId/messages', getMessages);
router.put('/:chatId/read', markAsRead);

module.exports = router;
