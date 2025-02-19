const User = require('../models/user');
const bcrypt = require('bcrypt');
const mailChecker = require('mailchecker');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')

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
    const verificationToken = jwt.sign({ Email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const newUser = new User({
      firstName,
      lastName,
      Email,
      userName,
      Password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // Token expires in 1 day
    });

    await newUser.save();
    await sendVerificationEmail(Email, verificationToken);

    // Respond with success message
    res.status(200).json({ message: "Signup successful. Please verify your email to continue." });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email provider
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
    logger: true, // Add logging
    debug: true,  // Enable debugging
  });

  const verificationUrl = `http://localhost:3001/verify-email/${token}`; // Change to frontend route
  const mailOptions = {
    from: 'no-reply@collabsphere.com',
    to: email,
    subject: 'Verify Your Email - CollabSphere',
    html: `
      <h1>Welcome to CollabSphere</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const verify_email = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);  // Change id to _id

    // Find the user by email and token
    const user = await User.findOne({
      Email: decoded.Email,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }, // Ensure the token is not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Mark the user as verified
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });

  } catch (err) {
    console.error('Error during email verification:', err);
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

module.exports = {
    user_login_get,
    user_login_post,
    user_signup_get,
    user_signup_post,
    user_myAccount_get,
    verify_email,
    searchUsers,
    getCurrentUser
};