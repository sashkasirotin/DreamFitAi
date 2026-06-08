/**
 * @file server.js
 * @description Main entry point for the DreamFitAI Express backend server.
 * Sets up middleware, establishes database connection, mounts API routing tables,
 * configures local uploads directory static serving, and provides general error fallback structures.
 */

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/pool'); // Database initializer script

// Route imports - maps endpoints to their specific controller file routing trees
const authRoutes = require('./routes/authRoutes');
const mealRoutes = require('./routes/mealRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adviceRoutes = require('./routes/adviceRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const storyRoutes = require('./routes/storyRoutes');
const waterRoutes = require('./routes/waterRoutes');
const newsRoutes = require('./routes/newsRoutes');

const app = express();
const port = process.env.PORT || 5000;

// ==========================================
// Middleware Configuration
// ==========================================

// Enable Cross-Origin Resource Sharing (CORS) so that frontend can communicate from other domains/ports
app.use(cors());

// Configure JSON parser. 10mb limit is required to support Base64 payloads (e.g. meal photos uploaded for AI analysis)
app.use(express.json({ limit: '10mb' }));

// URL-encoded form parser to handle nested values in application/x-www-form-urlencoded forms
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve the uploads directory statically. Allows user profile photos or meal pictures to be directly downloadable via HTTP
app.use('/uploads', express.static('uploads'));

// Health Check route, useful for deployment platforms like Render to confirm the server has booted successfully
app.get('/health', (req, res) => res.status(200).send('OK'));

// Initialize Database connection pool and create schemas/tables if they do not yet exist
initDb();

// ==========================================
// API Endpoint Routing Mapping
// ==========================================
app.use('/api/auth', authRoutes);         // User account management (Login, Register, Password)
app.use('/api/meals', mealRoutes);        // Meal logging, image upload, and Gemini vision analysis
app.use('/api/workouts', workoutRoutes);  // Workout exercises duration tracking
app.use('/api/progress', progressRoutes);  // Weight logging, body fat trends, and transformation photo entries
app.use('/api/advice', adviceRoutes);      // Daily AI Coach encouragement and nutritional advice
app.use('/api/roadmap', roadmapRoutes);    // Dynamic 4-week workout plans
app.use('/api/story', storyRoutes);        // Generates cohesive narrative journal from progress photos
app.use('/api/water', waterRoutes);        // Hydration tracker (add/reset glass limits)
app.use('/api/news', newsRoutes);          // NewsAPI CORS bypass proxy

// ==========================================
// Unified Global Error Handling Middleware
// ==========================================
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]:', err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!', 
        message: err.message 
    });
});

// Boot the server up and bind to designated PORT
app.listen(port, () => {
    console.log(`🚀 DreamFitAI Server running on port ${port}`);
});

