const User = require('../models/user')
const bcrypt = require('bcrypt');

// @desc    Get user profile
// @route   GET /api/profile/me
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-Password -emailVerificationToken -emailVerificationExpires');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/profile/me
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;

        await user.save();

        res.json({
            success: true,
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                Email: user.Email,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Error in updateProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
};

// @desc    Change password
// @route   PUT /api/profile/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.Password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.Password = hashedPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error in changePassword:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while changing password'
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword
};