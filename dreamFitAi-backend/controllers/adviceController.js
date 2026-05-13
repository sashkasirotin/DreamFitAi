const { callGeminiWithRetry } = require('../utils/aiHelper');
const { pool } = require('../db/pool');

exports.getAdvice = async (req, res) => {
    try {
        const mealsResult = await pool.query('SELECT * FROM meals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [req.user.id]);
        const workoutsResult = await pool.query('SELECT * FROM workouts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [req.user.id]);

        const prompt = `A user has recently eaten: ${JSON.stringify(mealsResult.rows)} and done these workouts: ${JSON.stringify(workoutsResult.rows)}. Provide a short, encouraging piece of fitness or nutrition advice based on this activity.`;

        const result = await callGeminiWithRetry('gemini-1.5-flash', prompt);
        const adviceText = result.text;

        res.json({ advice: adviceText, _usage: result.usage });
    } catch (err) {
        console.error('Gemini Advice error:', err);
        res.status(500).json({ error: 'Failed to generate AI advice', details: err.message });
    }
};
