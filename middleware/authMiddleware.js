// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
    try {
        console.log('Cookies:', req.cookies);
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ message: 'Auth token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { protect };