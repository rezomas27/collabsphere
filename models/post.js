const mongoose = require('mongoose');
const User = require('../models/user');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['showcase', 'seeking-contributors', 'looking-to-join', 'in-development', 'project-idea', 'other'],
        default: 'showcase'
    },
    github: {
        type: String,
        required: false
    },
    demo: {
        type: String,
        required: false
    },
    body: {
        type: String,
        required: true
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