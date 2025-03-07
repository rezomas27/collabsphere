// controllers/postController.js
const Post = require('../models/post')
const User = require('../models/user')

// Public route to browse posts
const browse_posts = async (req, res) => {
    try {
        console.log('Fetching posts, user:', req.user ? req.user._id : 'not authenticated');
        const posts = await Post.find()
            .sort({createdAt: -1})
            .populate('user', 'userName firstName lastName')
            .select('-comments')
            .lean(); // Convert to plain JavaScript objects
        
        console.log('Found posts:', posts.length);
        
        // If user is authenticated, add isLiked flag to each post
        if (req.user) {
            posts.forEach(post => {
                // Convert ObjectId to string for comparison
                const postUserId = post.user._id.toString();
                const currentUserId = req.user._id.toString();
                console.log('Comparing post user:', postUserId, 'with current user:', currentUserId);
                post.isLiked = post.likes.some(like => like.toString() === currentUserId);
                post.likeCount = post.likes.length;
            });
        } else {
            posts.forEach(post => {
                post.isLiked = false;
                post.likeCount = post.likes.length;
            });
        }
        
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
        console.log('Creating new post:', req.body);
        const { title, body, type, github, demo, projectUrl } = req.body;
        
        if (!title || !body || !type) {
            console.warn('Missing required fields in post creation');
            return res.status(400).json({ 
                message: 'Title, body, and type are required' 
            });
        }

        const post = new Post({
            title,
            type,
            body,
            github: github || '',
            demo: demo || '',
            projectUrl: projectUrl || '',
            user: req.user._id
        });

        const savedPost = await post.save();
        console.log(`Post created successfully: ${savedPost._id}`);
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
        
        const posts = await Post.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('user', 'userName')
            .limit(5);
            
        res.json(posts);
    } catch (error) {
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
            console.warn(`Post not found for like toggle: ${req.params.id}`);
            return res.status(404).json({ 
                success: false,
                message: 'Post not found' 
            });
        }

        const likeIndex = post.likes.indexOf(req.user._id);
        const isLiked = likeIndex === -1;

        if (isLiked) {
            post.likes.push(req.user._id);
            console.log(`User ${req.user._id} liked post ${post._id}`);
        } else {
            post.likes.splice(likeIndex, 1);
            console.log(`User ${req.user._id} unliked post ${post._id}`);
        }

        await post.save();

        // Return consistent data structure
        res.json({ 
            success: true,
            isLiked: isLiked,
            likeCount: post.likes.length
        });
    } catch (err) {
        console.error('Error toggling like:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error toggling like',
            error: err.message 
        });
    }
};

const getLikes = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ 
                success: false,
                message: 'Post not found' 
            });
        }

        // Get users who liked the post
        const users = await User.find({ _id: { $in: post.likes } })
            .select('userName firstName lastName');
        
        res.json({
            success: true,
            count: post.likes.length,
            users: users,
            isLiked: post.likes.includes(req.user._id)
        });
    } catch (err) {
        console.error('Error getting post likes:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error getting likes',
            error: err.message 
        });
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