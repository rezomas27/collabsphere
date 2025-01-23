const express = require('express');
const path = require('path');
const userRoutes = require('./routes/userRoutes'); // Import userRoutes
require('dotenv').config();
const Post = require('./models/post');  // Add this at the top
const cors = require('cors');
const cookieParser = require('cookie-parser');


const app = express();

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sammymozer:Snickers_27@cluster1.bsqxb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';

// Make sure these come before your routes
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3001', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add this after your routes to handle preflight requests
app.options('*', cors());


mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Middleware for parsing JSON
app.use(express.json());

// API routes
app.use('/api/users', userRoutes); // Mount user-related routes

// Replace the existing /api/posts route with:
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
});




// Serve React app for all non-API routes (production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });
}

// 404 fallback for API routes
app.use((req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
