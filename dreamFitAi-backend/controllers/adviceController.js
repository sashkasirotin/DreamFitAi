const { callGeminiWithRetry } = require('../utils/aiHelper');
const { pool } = require('../db/pool');
const { generateStaticAdvice } = require('../utils/fallbackGenerator');

exports.getAdvice = async (req, res) => {
    let mealsResult = { rows: [] };
    let workoutsResult = { rows: [] };
    try {
        mealsResult = await pool.query('SELECT * FROM meals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [req.user.id]);
        workoutsResult = await pool.query('SELECT * FROM workouts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [req.user.id]);

        const prompt = `A user has recently eaten: ${JSON.stringify(mealsResult.rows)} 
        and done these workouts: ${JSON.stringify(workoutsResult.rows)}. 
        Provide a short, encouraging piece of fitness or nutrition advice based on this activity.`;

        const result = await callGeminiWithRetry('gemini-2.5-flash', prompt);
        const adviceText = result.text;

        res.json({ advice: adviceText, _usage: result.usage });
    } catch (err) {
        console.warn('Gemini Advice error, falling back to static advice:', err.message);
        try {
            const staticAdvice = generateStaticAdvice(mealsResult.rows, workoutsResult.rows);
            res.json(staticAdvice);
        } catch (fallbackErr) {
            console.error('Advice Fallback Error:', fallbackErr);
            res.status(500).json({ error: 'Failed to generate AI advice', details: fallbackErr.message });
        }
    }
};
