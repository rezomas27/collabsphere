// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Debug logging
console.log('Loaded comment controller:', commentController);
console.log('getPostComments:', commentController.getPostComments);
console.log('createComment:', commentController.createComment);
console.log('updateComment:', commentController.updateComment);
console.log('deleteComment:', commentController.deleteComment);

// Get all comments for a post
router.get('/post/:postId', commentController.getPostComments);

//Get comment count for a user
router.get('/count/:userId', commentController.getCommentCount);

// Create a new comment (requires auth)
router.post('/', protect, commentController.createComment);

// Update a comment (requires auth)
router.put('/:commentId', protect, commentController.updateComment);

// Delete a comment (requires auth)
router.delete('/:commentId', protect, commentController.deleteComment);

module.exports = router;