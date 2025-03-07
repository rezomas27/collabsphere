// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
    try {
        // First check if user is authenticated via session
        if (req.isAuthenticated() && req.user) {
            console.log('User authenticated via session:', req.user._id);
            return next();
        }

        // If no session, check for JWT token
        const token = req.cookies.token;

        if (!token) {
            console.log('No authentication token found');
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded:', decoded);

            // Get user from token
            const user = await User.findById(decoded.id)
                .select('-Password -emailVerificationCode -emailVerificationExpires');

            if (!user) {
                console.log('User not found with token ID:', decoded.id);
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Attach user to request
            req.user = user;
            next();
        } catch (error) {
            console.log('Token verification failed:', error.message);
            
            // Clear invalid token
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            });

            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    } catch (error) {
        console.error('Protect middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

module.exports = { protect };