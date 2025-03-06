// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/login', userController.user_login_get);
router.post('/login', userController.user_login_post);
router.get('/signup', userController.user_signup_get);
router.post('/signup', userController.user_signup_post);
router.post('/verify-code', userController.verify_code);
router.post('/resend-verification', userController.resend_verification_code);

// Protected routes (require authentication)
router.get('/myAccount', protect, userController.user_myAccount_get);
router.get('/me', protect, userController.getCurrentUser);
router.get('/search', userController.searchUsers);
router.post('/logout', protect, userController.user_logout);

module.exports = router;