// controllers/commentController.js
const Comment = require('../models/comment');  // Changed from './models/Comment'
const Post = require('../models/post');     // Changed from './models/Post'

// @desc    Get all comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
const getPostComments = async (req, res) => {
    try {
        console.log('Fetching comments for post:', req.params.postId);
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
        .sort({ createdAt: -1 })
        .lean();

        console.log('Found comments count:', comments.length);
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
        console.log('Creating comment:', { postId, content, parentId });

        // Validate content length
        if (content.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Comment cannot be more than 1000 characters'
            });
        }

        // Validate URLs in content
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = content.match(urlRegex) || [];
        for (const url of urls) {
            try {
                new URL(url);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid URL found in comment'
                });
            }
        }

        if (!content?.trim()) {
            console.log('Comment content is empty');
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        if (!postId) {
            console.log('Post ID is missing');
            return res.status(400).json({
                success: false,
                message: 'Post ID is required'
            });
        }

        // Verify post exists
        const post = await Post.findById(postId);
        if (!post) {
            console.log('Post not found:', postId);
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // If parentId exists, verify parent comment exists
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                console.log('Parent comment not found:', parentId);
                return res.status(404).json({
                    success: false,
                    message: 'Parent comment not found'
                });
            }
        }

        // Create comment object
        const commentData = {
            content: content.trim(),
            user: req.user._id,
            post: postId,
            isReply: !!parentId,
            parentComment: parentId || null
        };

        console.log('Creating comment with data:', commentData);
        const comment = await Comment.create(commentData);
        
        // Populate user data
        const populatedComment = await Comment.findById(comment._id)
            .populate('user', 'userName')
            .lean();

        console.log('Comment created successfully:', populatedComment);
        res.status(201).json({
            success: true,
            data: populatedComment
        });
    } catch (error) {
        console.error('Error in createComment:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

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
        console.log('Updating comment:', req.params.commentId);
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            console.log('Comment not found:', req.params.commentId);
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Verify comment belongs to user
        if (comment.user.toString() !== req.user._id.toString()) {
            console.log('Unauthorized update attempt');
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this comment'
            });
        }

        comment.content = req.body.content.trim();
        await comment.save();
        console.log('Comment updated successfully');

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
        console.log('Deleting comment:', req.params.commentId);
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            console.log('Comment not found:', req.params.commentId);
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Verify comment belongs to user
        if (comment.user.toString() !== req.user._id.toString()) {
            console.log('Unauthorized delete attempt');
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        await comment.deleteOne();
        console.log('Comment deleted successfully');

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
        console.log('Getting comment count for user:', req.params.userId);
        const count = await Comment.countDocuments({ user: req.params.userId });
        console.log('Comment count:', count);
        res.json({ count });
    } catch (err) {
        console.error('Error in getCommentCount:', err);
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