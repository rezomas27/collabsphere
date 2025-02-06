// controllers/postController.js
const Post = require('../models/post')
const User = require('../models/user')

// Public route to browse posts
const browse_posts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({createdAt: -1})
            .populate('user', 'firstName lastName') // Only get user's name
            .select('-comments'); // Exclude comments for public view
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Authenticated route to get all posts with full details
const post_index = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({createdAt: -1})
            .populate('user');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Public route to view post details
const post_details = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'firstName lastName')
            .select('-comments'); // Exclude comments for public view
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Authenticated route to get post details with comments
const post_details_auth = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user'); // Only populate the user who created the post

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        console.error('Error in post_details_auth:', err);
        res.status(500).json({ 
            message: 'Internal server error',
            error: err.message
        });
    }
}

const post_create_get = (req, res) => {
    res.render('posts/create', { title: 'Create a new post' })
}

const post_create_post = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { title, body, type, github, demo } = req.body;
        
        if (!title || !body || !type) {
            return res.status(400).json({ 
                message: 'Title, body, and type are required' 
            });
        }

        // Auth check is now handled by middleware

        const post = new Post({
            title,
            type,
            body,
            github: github || '',
            demo: demo || '',
            user: req.user._id
        });

        const savedPost = await post.save();
        res.status(201).json(savedPost);

    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ 
            message: 'Error creating post',
            error: err.message 
        });
    }
};

const post_delete = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        // Check if user owns the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ redirect: '/posts' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    browse_posts,    // Public
    post_index,      // Auth required
    post_details,    // Public
    post_details_auth, // Auth required
    post_create_get,
    post_create_post,
    post_delete
}