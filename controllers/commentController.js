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
        .populate('user', 'userName')
        .populate({
            path: 'replies',
            populate: {
                path: 'user',
                select: 'userName'
            }
        })
        .sort({ createdAt: -1 });

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
        const { postId, content, parentId } = req.body;
        console.log('Received comment data:', { postId, content, parentId }); // Debug log

        // Verify post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // If parentId exists, verify parent comment exists
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent comment not found'
                });
            }
        }

        // Create comment object
        const commentData = {
            content,
            user: req.user._id,
            post: postId,
            isReply: !!parentId,
            parentComment: parentId || null
        };

        // Create and save the comment
        const comment = await Comment.create(commentData);
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

const getCommentCount = async (req, res) => {
    try {
        const count = await Comment.countDocuments({ user: req.params.userId });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getPostComments,
    createComment,
    updateComment,
    deleteComment,
    getCommentCount
};