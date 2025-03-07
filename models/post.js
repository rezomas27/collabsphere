const mongoose = require('mongoose');
const User = require('../models/user');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['showcase', 'seeking-contributors', 'looking-to-join', 'in-development', 'project-idea', 'other'],
        default: 'showcase'
    },
    github: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty values
                return /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-_.]+$/.test(v);
            },
            message: props => `${props.value} is not a valid GitHub URL!`
        }
    },
    demo: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty values
                return /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    projectUrl: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty values
                return /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    body: {
        type: String,
        required: true,
        maxlength: [5000, 'Description cannot be more than 5000 characters'],
        trim: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {timestamps: true});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;