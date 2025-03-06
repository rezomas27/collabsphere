const User = require('../models/user');
const Post = require('../models/post');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('./userController');
const mongoose = require('mongoose');
const sharp = require('sharp');


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

// @desc    Update user profile
// @route   PUT /api/profile/me
// @access  Private
const updateProfile = async (req, res) => {
    try {
        console.log('Update profile request received:', {
            userId: req.user._id,
            body: req.body
        });

        const { 
            firstName, 
            lastName, 
            bio, 
            skills, 
            github, 
            linkedin, 
            website, 
            location,
            email,
            socialLinks,
            profilePicture
        } = req.body;
        
        console.log('Received update data:', {
            firstName,
            lastName,
            bio,
            skills,
            github,
            linkedin,
            website,
            location,
            email,
            socialLinks,
            profilePicture
        });

        // Create update object with only provided fields
        const updates = {};
        if (firstName !== undefined) updates.firstName = firstName;
        if (lastName !== undefined) updates.lastName = lastName;
        if (bio !== undefined) updates.bio = bio;
        if (skills !== undefined) updates.skills = skills;
        if (github !== undefined) updates.github = github;
        if (linkedin !== undefined) updates.linkedin = linkedin;
        if (website !== undefined) updates.website = website;
        if (location !== undefined) updates.location = location;
        if (email !== undefined) updates.email = email;
        if (Array.isArray(socialLinks)) {
            updates.socialLinks = socialLinks.filter(link => link.platform && link.url);
        }
        if (profilePicture !== undefined) updates.profilePicture = profilePicture;

        console.log('Applying updates:', updates);

        // Update the user with the new fields
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-Password -emailVerificationToken -emailVerificationExpires');

        if (!updatedUser) {
            console.error('Failed to update user');
            return res.status(404).json({
                success: false,
                message: 'Failed to update user'
            });
        }

        // Get post counts for stats
        const [posts, collaborations, contributions] = await Promise.all([
            Post.countDocuments({ user: req.user._id }),
            Post.countDocuments({ type: 'seeking-contributors', user: req.user._id }),
            Post.countDocuments({ type: 'looking-to-join', user: req.user._id })
        ]);

        const responseData = {
            ...updatedUser.toObject(),
            stats: {
                posts,
                collaborations,
                contributions
            }
        };

        console.log('Profile updated successfully');
        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Error in updateProfile:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while updating profile'
        });
    }
};

// Add this function to generate a verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

// Add this function to handle sending verification code
const sendPasswordChangeCode = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate and save verification code
        const verificationCode = generateVerificationCode();
        user.passwordChangeCode = verificationCode;
        user.passwordChangeCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        try {
            // Send verification email with custom template
            const html = `
                <h1>Password Change Request</h1>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this change, please ignore this email.</p>
            `;

            await sendVerificationEmail(
                user.Email, 
                null, 
                'Password Change Verification', 
                html
            );

            res.json({
                success: true,
                message: 'Verification code sent to your email'
            });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Rollback the verification code if email fails
            user.passwordChangeCode = undefined;
            user.passwordChangeCodeExpires = undefined;
            await user.save();
            
            throw new Error('Failed to send verification email');
        }
    } catch (error) {
        console.error('Error in sendPasswordChangeCode:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send verification code'
        });
    }
};

// Update the changePassword function
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, verificationCode } = req.body;
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

        // Verify the code
        if (!user.passwordChangeCode || 
            user.passwordChangeCode !== verificationCode ||
            user.passwordChangeCodeExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.Password = hashedPassword;
        user.passwordChangeCode = undefined;
        user.passwordChangeCodeExpires = undefined;
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

// @desc    Update email
// @route   PUT /api/profile/update-email
// @access  Private
const updateEmail = async (req, res) => {
    try {
        const { newEmail } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is already taken
        // Check if email is valid
        if (!mailChecker.isValid(newEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        // Check if email is already taken
        const emailExists = await User.findOne({ Email: newEmail });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Generate verification token
        const verificationToken = jwt.sign({ Email: newEmail }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        // Update user with new email and verification token
        user.Email = newEmail;
        user.isVerified = false;
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
        
        await user.save();
        await sendVerificationEmail(newEmail, verificationToken);

        res.json({
            success: true,
            message: "Email updated. Please verify your new email address."
        });
    } catch (error) {
        console.error('Error in updateEmail:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating email'
        });
    }
};

// @desc    Delete account
// @route   DELETE /api/profile/delete-account
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Password is incorrect"
            });
        }

        // Delete user's posts
        await Post.deleteMany({ user: user._id });

        // Delete user account
        await User.findByIdAndDelete(req.user._id);

        res.json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error('Error in deleteAccount:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting account'
        });
    }
};

// Update the uploadProfilePicture function
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Compress and resize image
        const processedImage = await sharp(req.file.buffer)
            .resize(400, 400, { // Resize to reasonable dimensions
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 80 }) // Convert to JPEG and compress
            .toBuffer();

        // Convert processed image to base64
        const base64Image = `data:image/jpeg;base64,${processedImage.toString('base64')}`;

        // Update user's profile picture
        user.profilePicture = base64Image;
        await user.save();

        res.json({
            success: true,
            url: base64Image
        });
    } catch (error) {
        console.error('Error in uploadProfilePicture:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while uploading profile picture'
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getUserByUsername,
    updateEmail,
    deleteAccount,
    sendPasswordChangeCode,
    uploadProfilePicture
};