// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getProfile,
    updateProfile,
    changePassword,
    getUserByUsername
} = require('../controllers/profileController');

router.get('/user/:username', getUserByUsername); // Add this before protect middleware
// Apply authentication middleware to all profile routes
router.use(protect);

// Profile routes
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;