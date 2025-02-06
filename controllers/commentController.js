// controllers/commentController.js
const Comment = require('../models/comment');  // Changed from './models/Comment'
const Post = require('../models/post');     // Changed from './models/Post'

// @desc    Get all comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
const getPostComments = async (req, res) => {
    try {
        const comments = await Comment.find({ 
            post: req.params.postId,
            isReply: false // Only get top-level comments
        })
        .populate('user', 'userName') // Only get the username from user
        .sort({ createdAt: -1 }); // Sort by newest first

        res.json(comments);
    } catch (error) {
        console.error('Error in getPostComments:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching comments'
        });
    }
};

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
    try {
        const { postId, content } = req.body;

        // Verify post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Create comment object
        const commentData = {
            content,
            user: req.user._id,
            post: postId
        };

        // Create and save the comment
        const comment = await Comment.create(commentData);
        
        // Populate user info before sending response
        await comment.populate('user', 'userName');

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        console.error('Error in createComment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating comment'
        });
    }
};

// @desc    Update a comment
// @route   PUT /api/comments/:commentId
// @access  Private
const updateComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Verify comment belongs to user
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this comment'
            });
        }

        comment.content = req.body.content;
        await comment.save();

        res.json({
            success: true,
            data: comment
        });
    } catch (error) {
        console.error('Error in updateComment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating comment'
        });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Verify comment belongs to user
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        await comment.deleteOne();

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteComment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting comment'
        });
    }
};

module.exports = {
    getPostComments,
    createComment,
    updateComment,
    deleteComment
};