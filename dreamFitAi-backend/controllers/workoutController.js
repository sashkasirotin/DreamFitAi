const { pool } = require('../db/pool');

exports.getWorkouts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM workouts WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addWorkout = async (req, res) => {
    try {
        const { description, duration_minutes } = req.body;
        const result = await pool.query(
            'INSERT INTO workouts (user_id, description, duration_minutes) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, description, duration_minutes]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
