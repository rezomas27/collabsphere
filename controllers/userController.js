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
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send response with redirect URL
    res.status(200).json({
      success: true,
      redirectUrl: '/posts',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.Email
      }
    });

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const generateToken = async (user, statusCode, res) => {
  const token = await user.jwtGenerateToken();
  console.log('Generated Token:', token); // Add this line for debugging

  // Parse expiration time from environment variable and convert to milliseconds
  const expireToken = parseInt(process.env.EXPIRE_TOKEN) * 1000 || 3600 * 1000; // Default expiry time in milliseconds

  const options = {
      httpOnly: true,
      expires: new Date(Date.now() + expireToken) // Convert seconds to milliseconds
  };

  res
      .status(statusCode)
      .cookie('token', token, options)
      .redirect('/posts');
};

const user_signup_get = (req, res) => {
    const errorMessage = req.errorMessage; // Replace req.errorMessage with the actual variable containing the error message
    res.render('noaccess/signup', { title: 'Signup', errorMessage });
};

const user_signup_post = async (req, res) => {
  const { firstName, lastName, Email, Password, confirmPassword } = req.body;

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

    const hashedPassword = await bcrypt.hash(Password, 10);
    const verificationToken = jwt.sign({ Email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const newUser = new User({
      firstName,
      lastName,
      Email,
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

module.exports = {
    user_login_get,
    user_login_post,
    user_signup_get,
    user_signup_post,
    user_myAccount_get,
    verify_email
};
