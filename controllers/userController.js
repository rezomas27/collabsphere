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

    // Generate JWT token
    const token = await user.jwtGenerateToken();
    const expiresIn = process.env.EXPIRE_TOKEN || '1h';
    const maxAge = expiresIn.includes('h') ? 
    parseInt(expiresIn) * 60 * 60 * 1000 : 
    parseInt(expiresIn) * 1000;
    
    res
      .status(200)
      .cookie('token', token, {
        httpOnly: true,
        maxAge: maxAge 
      })
      .json({
        success: true,
        redirectUrl: '/posts'
      });
      
  } catch (err) {
    res.status(500).json({ message: err.message });
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
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data' });
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
        console.log('Headers:', {
            csrf: req.headers['x-csrf-token'],
            cookie: req.headers.cookie,
            host: req.headers.host,
            contentType: req.headers['content-type']
        });

        // Validate CSRF token
        const csrfToken = req.headers['x-csrf-token'];
        if (!csrfToken) {
            console.error('No CSRF token provided');
            return res.status(403).json({
                success: false,
                message: 'CSRF token is required'
            });
        }

        // Log the token being used
        console.log('Using CSRF token:', csrfToken);
        
        // Clear the JWT token cookie with all necessary options
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: new Date(0),
            domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined
        });

        console.log('Token cookie cleared');

        // Also clear any other auth-related cookies
        res.clearCookie('XSRF-TOKEN', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: new Date(0)
        });

        console.log('CSRF cookie cleared');

        // Send response with success
        console.log('Sending success response');
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', {
            message: error.message,
            stack: error.stack,
            headers: req.headers
        });
        res.status(500).json({
            success: false,
            message: 'Error during logout'
        });
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
    user_logout
};