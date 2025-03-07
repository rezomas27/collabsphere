// Add to messageRoutes.js - new route for message sync

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getMessages,
    getConversationMessages,
    sendMessage,
    markAsRead,
    deleteConversation,
    syncMessages   // Add this new controller method
} = require('../controllers/messageController');

router.use(protect);

// Get all messages for the current user
router.get('/', getMessages);

// Get messages for a specific conversation
router.get('/conversation/:userId', getConversationMessages);

// Send a new message
router.post('/', sendMessage);

// Mark a message as read
router.put('/:messageId/read', markAsRead);

// Delete an entire conversation
router.delete('/conversation/:userId', deleteConversation);

// New route for message synchronization
router.get('/sync', syncMessages);

module.exports = router;