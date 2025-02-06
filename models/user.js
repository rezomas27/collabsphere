const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')

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
        required: true
    },
    isVerified: { type: Boolean, default: false }, // Email verification status
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
}, {timestamps:true});

//get the token
userSchema.methods.jwtGenerateToken = function() {
    try {
        const expiresIn = process.env.EXPIRE_TOKEN || '1h'; // Default to 1 hour
        return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn });
    } catch (error) {
        console.error('Error generating JWT:', error);
        throw new Error('Failed to generate token');
    }
};



const User = mongoose.model('User',userSchema);

module.exports=User;