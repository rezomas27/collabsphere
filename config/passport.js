const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const mongoose = require('mongoose');

// Check if required environment variables are set
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Missing Google OAuth credentials in environment variables');
    process.exit(1);
}

// Use environment variables for the callback URL
const callbackURL = process.env.NODE_ENV === 'production' 
    ? `${process.env.BASE_URL}/api/users/auth/google/callback`
    : 'http://localhost:3000/api/users/auth/google/callback';

console.log('Configuring Google Strategy with:', {
    clientID: `${process.env.GOOGLE_CLIENT_ID.substring(0, 8)}...`,
    callbackURL: callbackURL
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    proxy: true,
    passReqToCallback: true
}, async function(req, accessToken, refreshToken, profile, done) {
    try {
        console.log('Google OAuth callback received:', {
            profileId: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName
        });

        if (!profile.emails || !profile.emails[0]) {
            console.error('No email provided by Google');
            return done(new Error('No email provided by Google'));
        }

        const email = profile.emails[0].value;
        const userName = profile.displayName.replace(/\s+/g, '').toLowerCase();

        // Try to find user by Google ID first
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
            // If not found by Google ID, try to find by email
            user = await User.findOne({ Email: email });
            
            if (!user) {
                // Create new user if doesn't exist
                user = new User({
                    Email: email,
                    userName: userName,
                    firstName: profile.name?.givenName || '',
                    lastName: profile.name?.familyName || '',
                    isVerified: true,
                    googleId: profile.id
                });

                try {
                    await user.save();
                    console.log('New user created:', user._id);
                } catch (saveError) {
                    if (saveError.code === 11000) {
                        // Handle duplicate username
                        user.userName = `${userName}${Math.floor(Math.random() * 1000)}`;
                        await user.save();
                        console.log('User created with modified username:', user._id);
                    } else {
                        throw saveError;
                    }
                }
            } else {
                // Update existing user with Google ID
                user.googleId = profile.id;
                user.isVerified = true;
                await user.save();
                console.log('Updated existing user with Google ID:', user._id);
            }
        }

        return done(null, user);
    } catch (error) {
        console.error('Error in Google Strategy:', error);
        return done(error, null);
    }
}));

// Serialize user for the session
passport.serializeUser((user, done) => {
    try {
        const sessionUser = {
            _id: user._id.toString(),
            Email: user.Email,
            userName: user.userName
        };
        console.log('Serializing user:', sessionUser);
        done(null, sessionUser);
    } catch (error) {
        console.error('Error serializing user:', error);
        done(error, null);
    }
});

// Deserialize user from the session
passport.deserializeUser(async (sessionUser, done) => {
    try {
        if (!sessionUser._id || !mongoose.Types.ObjectId.isValid(sessionUser._id)) {
            console.error('Invalid user data in session:', sessionUser);
            return done(null, false);
        }

        const user = await User.findById(sessionUser._id)
            .select('-Password -emailVerificationCode -emailVerificationExpires');

        if (!user) {
            console.error('User not found in database:', sessionUser._id);
            return done(null, false);
        }

        console.log('User deserialized:', user._id);
        done(null, user);
    } catch (error) {
        console.error('Error deserializing user:', error);
        done(error, null);
    }
});

module.exports = passport; 