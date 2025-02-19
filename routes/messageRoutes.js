// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getMessages,
    sendMessage,
    markAsRead
} = require('../controllers/messageController');

router.use(protect);
router.get('/', getMessages);
router.post('/', sendMessage);
router.put('/:messageId/read', markAsRead);

module.exports = router;