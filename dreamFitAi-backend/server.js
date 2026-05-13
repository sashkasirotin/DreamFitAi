require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/pool');

// Route imports
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

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Health Check for Render
app.get('/health', (req, res) => res.status(200).send('OK'));

// Initialize Database
initDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/advice', adviceRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/story', storyRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/news', newsRoutes);

// Error Handling Middleware (Unified)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

app.listen(port, () => {
    console.log(`🚀 DreamFitAI Server running on port ${port}`);
});
