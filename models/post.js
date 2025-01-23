const mongoose = require('mongoose');
const User = require('../models/user');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required:true
    },
    type:{
        type: String,
        required:true
    },
    body:{
        type: String,
        required: true
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

}, {timestamps:true});

const Post = mongoose.model('Post',postSchema);

module.exports=Post;