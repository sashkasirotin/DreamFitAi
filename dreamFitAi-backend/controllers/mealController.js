const { pool } = require('../db/pool');
const { callGeminiWithRetry } = require('../utils/aiHelper');

exports.getMeals = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM meals WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addMeal = async (req, res) => {
    try {
        const { description, calories } = req.body;
        let imageUrl = null;

        if (req.file) {
            if (req.file.filename) {
                imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            } else {
                imageUrl = req.file.path;
            }
        }
        
        const result = await pool.query(
            'INSERT INTO meals (user_id, description, calories, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, description, calories, imageUrl]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.analyzeMeal = async (req, res) => {
    try {
        const { description, image } = req.body; // image is now { data, mimeType }

        let promptParts = [];
        
        if (image && image.data) {
            promptParts.push({
                inlineData: {
                    data: image.data,
                    mimeType: image.mimeType || "image/jpeg"
                }
            });
        }

        promptParts.push({ text: `Analyze this meal ${description ? `(User description: "${description}")` : "from the image"}. 
        Estimate the total calories and provide a brief breakdown of why. 
        Respond ONLY in JSON format: { "description": "short name of meal", "calories": number, "breakdown": "brief text" }.` });

        const result = await callGeminiWithRetry('gemini-2.5-flash', promptParts);
        const responseText = result.text;
        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI returned an invalid response format');
        }

        const analysis = JSON.parse(jsonMatch[0]);
        res.json({ ...analysis, _usage: result.usage });
    } catch (err) {
        console.error('Gemini Analysis error:', err);
        res.status(500).json({ error: 'Failed to analyze meal data', details: err.message });
    }
};
