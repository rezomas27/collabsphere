// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Public routes (no auth required)
router.get('/browse', postController.browse_posts);
router.get('/view/:id', postController.post_details);
router.get('/user/me', protect, postController.getUserPosts); // Add this new route
router.get('/user/:userId', postController.getUserPosts);
router.get('/:id/likes', protect, postController.getLikes);  // Add this new route


// Protected routes (auth required)
router.post('/', protect, postController.post_create_post);
router.get('/create', protect, postController.post_create_get);
router.get('/auth/:id', protect, postController.post_details_auth);
router.delete('/:id', protect, postController.post_delete);
router.get('/', protect, postController.post_index);
router.put('/:id', protect, postController.post_update);
router.post('/:id/like', protect, postController.toggleLike);


module.exports = router;