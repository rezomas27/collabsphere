require('dotenv').config();
const express = require('express');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const commentRoutes = require('./routes/commentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const passport = require('./config/passport');
const MongoStore = require('connect-mongo');
const http = require('http');
const setupWebSocket = require('./server/websocket');

const Post = require('./models/post');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const app = express();
const server = http.createServer(app);

// Setup WebSocket server with proper configuration
const wsServer = setupWebSocket(server);
app.set('wsServer', wsServer);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.REACT_APP_BASE_URL 
        : ['http://localhost:3000', 'http://localhost:3001'], // Allow both ports
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}));

// MongoDB connection with retry logic
const connectDB = async (retryCount = 0) => {
    const maxRetries = 5;
    const retryDelay = 5000;

    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('MongoDB connection error:', {
            message: error.message,
            retryCount,
            maxRetries
        });

        if (retryCount < maxRetries) {
            console.log(`Retrying connection in ${retryDelay}ms...`);
            setTimeout(() => connectDB(retryCount + 1), retryDelay);
        } else {
            console.error('Failed to connect to MongoDB after maximum retries');
            process.exit(1);
        }
    }
};

// Initialize MongoDB connection
connectDB();

// Session configuration with MongoDB store
const sessionConfig = {
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60,
        autoRemove: 'native',
        touchAfter: 24 * 3600,
        mongoOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
        path: '/'
    },
    name: 'sessionId'
};

// Apply session middleware
app.use(session(sessionConfig));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Add session debugging middleware
app.use((req, res, next) => {
    console.log('Session Debug:', {
        sessionID: req.sessionID,
        isAuthenticated: req.isAuthenticated(),
        userId: req.session?.userId,
        user: req.user ? {
            _id: req.user._id,
            email: req.user.Email
        } : 'No user'
    });
    next();
});

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));
app.use(mongoSanitize());
app.use(hpp());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        status: err.status || 500
    });
    res.status(err.status || 500).json({ 
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong!' 
            : err.message
    });
});

// Update your server startup to use the HTTP server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server is ready for connections`);
});
