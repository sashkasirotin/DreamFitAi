/**
 * @file pool.js
 * @description Configures the PostgreSQL connection pool using `pg` and runs schema initialization.
 * Dynamic SSL configuration allows local development (no SSL) and secure production deployment.
 */

const { Pool } = require('pg');

// Create connection pool referencing database URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Enable SSL rejection safety for cloud PostgreSQL instances like Neon or Render in production
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Connection timeout defaults to 5 seconds to prevent backend thread hangs
    connectionTimeoutMillis: 5000,
});

/**
 * Runs SQL scripts to initialize schema tables if they do not exist,
 * and ensures column migrations are handled transparently.
 */
const initDb = async () => {
    const query = `
    -- Users table stores authentication credentials, target configurations and avatars
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      goal_calories INTEGER DEFAULT 2000,
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Meals table records food intake, target calorie values, proteins, and AI breakdowns
    CREATE TABLE IF NOT EXISTS meals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      calories INTEGER,
      protein INTEGER,
      image_url TEXT,
      ai_breakdown TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Workouts table records duration of physical activities
    CREATE TABLE IF NOT EXISTS workouts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      duration_minutes INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Progress table logs weekly body measurements and transformation snapshots
    CREATE TABLE IF NOT EXISTS progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      weight DECIMAL(5,2),
      body_fat DECIMAL(4,2),
      photo_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Roadmaps table houses generated 4-week workout programs as structured JSONB documents
    CREATE TABLE IF NOT EXISTS roadmaps (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      daily_goal INTEGER,
      weeks JSONB,
      tips JSONB,
      is_fallback BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Upgrade schemas if legacy string versions were present
    ALTER TABLE roadmaps ALTER COLUMN weeks TYPE JSONB USING weeks::JSONB;
    ALTER TABLE roadmaps ALTER COLUMN tips TYPE JSONB USING tips::JSONB;
    
    -- Water logs registers intake measurements. A composite Unique key guarantees one row per user, per day
    CREATE TABLE IF NOT EXISTS water_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date DATE DEFAULT CURRENT_DATE,
      amount_ml INTEGER DEFAULT 0,
      UNIQUE (user_id, date)
    );
    
    -- Safety migration to ensure protein metric is present on meals table
    ALTER TABLE meals ADD COLUMN IF NOT EXISTS protein INTEGER;

    -- Safety migration to ensure is_fallback is present on meals table
    ALTER TABLE meals ADD COLUMN IF NOT EXISTS is_fallback BOOLEAN DEFAULT FALSE;

    -- Safety migration to ensure is_fallback is present on roadmaps table
    ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS is_fallback BOOLEAN DEFAULT FALSE;

    -- Safety migration to ensure profile questionnaire config is present on roadmaps table
    ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS profile JSONB;
  `;
    try {
        await pool.query(query);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

module.exports = { pool, initDb };

