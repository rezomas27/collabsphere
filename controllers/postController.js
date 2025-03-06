// controllers/postController.js
const Post = require('../models/post')
const User = require('../models/user')

// Public route to browse posts
const browse_posts = async (req, res) => {
    try {
        console.log('Fetching posts for browse...');
        const posts = await Post.find()
            .sort({createdAt: -1})
            .populate('user', 'userName firstName lastName')
            .select('-comments')
            .lean(); // Convert to plain JavaScript objects
        
        console.log(`Found ${posts.length} posts`);
        
        // Always return a success response, even with empty data
        res.json({
            success: true,
            data: posts || []
        });
    } catch (err) {
        console.error('Error in browse_posts:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching posts',
            error: err.message 
        });
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

const getUserPosts = async (req, res) => {
    try {
        const userId = req.params.userId || req.user._id;
        console.log('Fetching posts for user:', userId);
        
        const posts = await Post.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('user', 'userName')
            .limit(5);
            
        console.log('Found posts:', posts);
        res.json(posts);
    } catch (error) {
        console.error('Error getting user posts:', error);
        res.status(500).json({ message: error.message });
    }
};



const post_update = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
  
        // Check if user owns the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }
  
        const { title, body, type, github, demo, projectUrl } = req.body;
  
        if (!title || !body || !type) {
            return res.status(400).json({ 
                message: 'Title, body, and type are required' 
            });
        }
  
        post.title = title;
        post.body = body;
        post.type = type;
        post.github = github || '';
        post.demo = demo || '';
        post.projectUrl = projectUrl || '';
  
        const updatedPost = await post.save();
        res.json(updatedPost);
  
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ 
            message: 'Error updating post',
            error: err.message 
        });
    }
};

const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.user._id);
        if (likeIndex === -1) {
            // Like the post
            post.likes.push(req.user._id);
        } else {
            // Unlike the post
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        res.json({ likes: post.likes.length, isLiked: likeIndex === -1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getLikes = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Get users who liked the post
        const users = await User.find({ _id: { $in: post.likes } })
            .select('userName firstName lastName');
        
        res.json({
            count: post.likes.length,
            users: users,
            isLiked: post.likes.includes(req.user._id)
        });
    } catch (err) {
        console.error('Error getting post likes:', err);
        res.status(500).json({ error: err.message });
    }
};


module.exports = {
    browse_posts,    // Public
    post_index,      // Auth required
    post_details,    // Public
    post_details_auth, // Auth required
    post_create_get,
    post_create_post,
    post_delete,
    getUserPosts,
    post_update,
    toggleLike,
    getLikes
}