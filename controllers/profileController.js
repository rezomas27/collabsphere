const User = require('../models/user');
const Post = require('../models/post'); // Add this line
const bcrypt = require('bcrypt');


// @desc    Get user profile
// @route   GET /api/profile/me
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-Password -emailVerificationToken -emailVerificationExpires');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get post counts
        const posts = await Post.find({ user: user._id });
        const collaborations = await Post.find({ 
            type: 'seeking-contributors',
            user: user._id 
        });
        const contributions = await Post.find({
            type: 'looking-to-join',
            user: user._id
        });

        res.json({
            success: true,
            data: {
                ...user.toObject(),
                stats: {
                    posts: posts.length,
                    collaborations: collaborations.length,
                    contributions: contributions.length
                }
            }
        });
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            bio, 
            skills, 
            github, 
            linkedin, 
            website, 
            location 
        } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields if provided
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (bio !== undefined) user.bio = bio;
        if (skills) user.skills = skills;
        if (github !== undefined) user.github = github;
        if (linkedin !== undefined) user.linkedin = linkedin;
        if (website !== undefined) user.website = website;
        if (location !== undefined) user.location = location;

        await user.save();

        res.json({
            success: true,
            data: user
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

const getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ userName: req.params.username })
            .select('-Password -emailVerificationToken -emailVerificationExpires');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getUserByUsername
};