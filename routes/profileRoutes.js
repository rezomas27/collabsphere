// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getProfile,
    updateProfile,
    changePassword
} = require('../controllers/profileController');

// Apply authentication middleware to all profile routes
router.use(protect);

// Profile routes
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;