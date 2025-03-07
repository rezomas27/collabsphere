const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    firstName: {
        type: String,
        required:true
    },
    lastName: {
        type: String,
        required:true
    },
    userName: {
        type: String,
        required: true,
        unique: true, // Ensures username uniqueness
        trim: true,
        lowercase: true, // Normalizes the username
    },
    Email: {
        type: String,
        required: true,
        unique: true, // Ensures email uniqueness
        trim: true,
        lowercase: true, // Normalizes the email address
    },    
    Password:{
        type: String,
        required: function() {
            return !this.googleId; // Password is required only if not using Google auth
        }
    },
    isVerified: { type: Boolean, default: false }, // Email verification status
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    emailVerificationCode: {
        type: String
    },
    bio: {
        type: String,
        default: ''
    },
    skills: [{
        type: String
    }],
    github: {
        type: String,
        default: ''
    },
    linkedin: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    passwordChangeCode: { type: String },
    passwordChangeCodeExpires: { type: Date },
    profilePicture: {
        type: String, // Will store base64 string
        default: ''
    },
    socialLinks: [{
        platform: String,
        url: String
    }],
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
}, {timestamps:true});

//get the token
userSchema.methods.jwtGenerateToken = function() {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.EXPIRE_TOKEN || '24h' }
    );
};

const User = mongoose.model('User',userSchema);

module.exports=User;