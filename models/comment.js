const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        maxlength: [1000, 'Comment cannot be more than 1000 characters'],
        trim: true,
        validate: {
            validator: function(v) {
                // Check for URLs in content
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                const urls = v.match(urlRegex) || [];
                return urls.every(url => {
                    try {
                        new URL(url);
                        return true;
                    } catch (e) {
                        return false;
                    }
                });
            },
            message: props => 'Invalid URL found in comment'
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    isReply: {
        type: Boolean,
        default: false
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for replies
commentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentComment'
});

module.exports = mongoose.model('Comment', commentSchema);
