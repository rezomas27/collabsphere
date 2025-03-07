// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const {
    getProfile,
    updateProfile,
    changePassword,
    getUserByUsername,
    updateEmail,
    deleteAccount,
    sendPasswordChangeCode,
    uploadProfilePicture
} = require('../controllers/profileController');

// Configure multer with stricter limits
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Only allow jpeg and png
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG and PNG images are allowed!'), false);
        }
    }
});

// Middleware to prevent Google users from accessing password-related routes
const preventGoogleUsers = async (req, res, next) => {
    if (req.user.googleId) {
        return res.status(403).json({
            success: false,
            message: 'This feature is not available for Google-authenticated users'
        });
    }
    next();
};

// Add this new route before protect middleware
router.get('/user/:username', getUserByUsername);

// Apply authentication middleware to all profile routes
router.use(protect);

// Profile routes
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/change-password', preventGoogleUsers, changePassword);
router.put('/update-email', updateEmail);
router.delete('/delete-account', deleteAccount);
router.post('/send-password-code', preventGoogleUsers, sendPasswordChangeCode);
router.post('/upload-picture', upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;