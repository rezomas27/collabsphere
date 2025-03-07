const User = require('../models/user');
const bcrypt = require('bcrypt');
const mailChecker = require('mailchecker');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const Message = require('../models/message');
const Post = require('../models/post');


if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Missing email credentials in environment variables:', {
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Missing'
  });
}

const user_login_get = (req, res) => {
    const errorMessage = req.errorMessage; // Replace req.errorMessage with the actual variable containing the error message
};

// In userController.js, update user_login_post:
const user_login_post = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ Email: email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email to log in.' });
    }

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Set user in session
    req.login(user, async (err) => {
      if (err) {
        console.error('Session login error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error during login' 
        });
      }

      // Generate JWT token
      const token = await user.jwtGenerateToken();
      
      // Set cookies with consistent options
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      // Set temporary auth success cookie for frontend
      res.cookie('auth_success', 'true', {
        httpOnly: false,
        maxAge: 5000 // 5 seconds
      });

      console.log('Login successful:', {
        userId: user._id,
        sessionId: req.sessionID
      });

      res.status(200).json({
        success: true,
        message: 'Successfully logged in'
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

const user_signup_get = (req, res) => {
    const errorMessage = req.errorMessage; // Replace req.errorMessage with the actual variable containing the error message
    res.render('noaccess/signup', { title: 'Signup', errorMessage });
};

// Add this helper function to generate a random code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

const user_signup_post = async (req, res) => {
    const { firstName, lastName, Email, userName, Password, confirmPassword } = req.body;

    try {
        if (!mailChecker.isValid(Email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        const user = await User.findOne({ Email });
        if (user) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordPattern.test(Password)) {
            return res.status(400).json({
                message: "Password must contain 1 uppercase letter, 1 number, and be at least 8 characters",
            });
        }

        if (Password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords don't match" });
        }

        const user1 = await User.findOne({ userName });
        if (user1) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);
        const verificationCode = generateVerificationCode();

        const newUser = new User({
            firstName,
            lastName,
            Email,
            userName,
            Password: hashedPassword,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: Date.now() + 30 * 60 * 1000,
        });

        try {
            // Try to send email first before saving user
            await sendVerificationEmail(Email, verificationCode);
            
            // If email sends successfully, save the user
            await newUser.save();

            res.status(200).json({ 
                message: "Signup successful. Please check your email for the verification code.",
                email: Email
            });
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            res.status(500).json({ 
                message: "Failed to send verification email. Please try again.",
                error: emailError.message
            });
        }
    } catch (err) {
        console.error("Error during signup:", err);
        res.status(500).json({ 
            message: "Internal server error",
            error: err.message
        });
    }
};

// Update the transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com', // Use the actual Office 365 SMTP server
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'sam@dolphdive.com', // Hardcode this temporarily
    pass: process.env.EMAIL_PASS
  },
  tls: {
    minVersion: 'TLSv1.2'
  }
});

// Add immediate verification test
(async () => {
  try {
    console.log('Testing email configuration:', {
      user: 'sam@dolphdive.com',
      passLength: process.env.EMAIL_PASS?.length
    });
    await transporter.verify();
    console.log('Email configuration verified successfully');
  } catch (error) {
    console.error('Email verification failed:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
  }
})();

const sendVerificationEmail = async (email, verificationCode) => {
  const mailOptions = {
    from: {
      name: 'DolphDive',
      address: 'sam@dolphdive.com' // Hardcode this temporarily
    },
    to: email,
    subject: 'Verify your DolphDive account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to DolphDive!</h2>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>Please enter this code to verify your account.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <br>
        <p>Best regards,</p>
        <p>The DolphDive Team</p>
      </div>
    `
  };

  try {
    console.log('Attempting to send email:', {
      from: mailOptions.from.address,
      to: email,
      subject: mailOptions.subject
    });
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      response: info.response
    });
    return info;
  } catch (error) {
    console.error('Detailed email error:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      stack: error.stack
    });
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

// Replace verify_email with verify_code
const verify_code = async (req, res) => {
    try {
        const { email, code } = req.body;

        // Find the user by email and verification code
        const user = await User.findOne({
            Email: email,
            emailVerificationCode: code,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }

        // Mark the user as verified
        user.isVerified = true;
        user.emailVerificationCode = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });

    } catch (err) {
        console.error('Error during code verification:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add a resend verification code function
const resend_verification_code = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ Email: email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified.' });
        }

        const newCode = generateVerificationCode();
        user.emailVerificationCode = newCode;
        user.emailVerificationExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

        await user.save();
        await sendVerificationEmail(email, newCode);

        res.status(200).json({ message: 'New verification code sent successfully.' });
    } catch (err) {
        console.error('Error resending verification code:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const user_myAccount_get = (req, res) => {
    const user = req.user; // Get the authenticated user from the middleware
    if (user) {
        res.render('access/myAccount', { title: 'myAccount', user });
    } else {
        res.redirect('/login');
    }
};

// Add to userController.js
const searchUsers = async (req, res) => {
  try {
      const username = req.query.username;
      const users = await User.find({
          userName: { $regex: username, $options: 'i' }
      })
      .select('userName _id')
      .limit(5);
      
      res.json(users);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
    try {
        console.log('Getting current user:', {
            isAuthenticated: req.isAuthenticated(),
            sessionUser: req.user ? req.user._id : 'No session user',
            cookies: req.cookies
        });

        if (!req.user || !req.user._id) {
            console.error('No authenticated user found');
            return res.status(401).json({ 
                success: false,
                message: 'Not authenticated' 
            });
        }

        const user = await User.findById(req.user._id)
            .select('-Password -emailVerificationCode -emailVerificationExpires');
        
        if (!user) {
            console.error('User not found in database:', req.user._id);
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        console.log('User found:', user._id);
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error in getCurrentUser:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            success: false,
            message: 'Error fetching user data',
            error: error.message 
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        // Delete all posts by the user
        await Post.deleteMany({ user: req.user._id });
        
        // Delete the user
        await User.findByIdAndDelete(req.user._id);
        
        res.json({ message: 'User and associated posts deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private
const user_logout = async (req, res) => {
    try {
        console.log('Logout request received');
        console.log('User:', req.user ? req.user._id : 'No user found');

        // Destroy the session first
        if (req.session) {
            await new Promise((resolve, reject) => {
                req.session.destroy(err => {
                    if (err) {
                        console.error('Session destruction error:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }

        // Clear Passport login session
        req.logout(function(err) {
            if (err) {
                console.error('Passport logout error:', err);
            }
        });

        // Clear all cookies with various options to ensure they're removed in all environments
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: new Date(0)
        };

        res.clearCookie('token', cookieOptions);
        res.clearCookie('sessionId', cookieOptions);
        res.clearCookie('connect.sid', cookieOptions);
        res.clearCookie('XSRF-TOKEN', cookieOptions);
        res.clearCookie('auth_success', cookieOptions);

        // Send response with cache control headers
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Error during logout'
        });
    }
};

// Google authentication callback
const googleAuthCallback = async (req, res) => {
    try {
        console.log('Google Auth Callback - User:', req.user);
        
        if (!req.user) {
            console.error('No user data in request');
            return res.redirect('http://localhost:3001/login?error=auth_failed');
        }

        // Check if this is for account deletion
        const isForDeletion = req.query.state === 'delete_account';
        
        if (isForDeletion) {
            // Set a flag in the session indicating successful Google auth for deletion
            req.session.googleAuthForDeletion = true;
            return res.redirect('http://localhost:3001/settings?googleAuth=success');
        }

        // Normal login flow
        req.session.userId = req.user._id;
        
        // Generate JWT token
        const token = await req.user.jwtGenerateToken();
        
        // Set cookies
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Set a temporary cookie to indicate successful auth to the frontend
        res.cookie('auth_success', 'true', {
            httpOnly: false,
            maxAge: 5000 // 5 seconds
        });

        console.log('Redirecting to frontend after successful Google auth');
        res.redirect('http://localhost:3001/posts');
    } catch (error) {
        console.error('Google auth callback error:', error);
        res.redirect('http://localhost:3001/login?error=auth_failed');
    }
};

module.exports = {
    user_login_get,
    user_login_post,
    user_signup_get,
    user_signup_post,
    user_myAccount_get,
    verify_code,
    resend_verification_code,
    searchUsers,
    getCurrentUser,
    sendVerificationEmail,
    deleteUser,
    user_logout,
    googleAuthCallback
};