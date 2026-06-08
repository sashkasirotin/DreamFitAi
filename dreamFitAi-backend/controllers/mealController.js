const { pool } = require('../db/pool');
const { callGeminiWithRetry } = require('../utils/aiHelper');
const { generateStaticMealAnalysis } = require('../utils/fallbackGenerator');

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
        const { description, calories, protein } = req.body;
        let imageUrl = null;

        if (req.file) {
            if (req.file.filename) {
                imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            } else {
                imageUrl = req.file.path;
            }
        }
        
        const result = await pool.query(
            'INSERT INTO meals (user_id, description, calories, protein, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, description, calories, protein, imageUrl]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.analyzeMeal = async (req, res) => {
    const { description, image } = req.body; // image is now { data, mimeType }
    try {
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
        Estimate the total calories and protein content in grams, and provide a brief breakdown of why. 
        Respond ONLY in JSON format: { "description": "short name of meal", "calories": number, "protein": number, "breakdown": "brief text" }.` });

        const result = await callGeminiWithRetry('gemini-2.5-flash', promptParts);
        const responseText = result.text;
        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI returned an invalid response format');
        }

        const analysis = JSON.parse(jsonMatch[0]);
        res.json({ ...analysis, _usage: result.usage });
    } catch (err) {
        console.warn('Gemini Meal Analysis error, falling back to static estimator:', err.message);
        try {
            const staticAnalysis = generateStaticMealAnalysis(description);
            res.json(staticAnalysis);
        } catch (fallbackErr) {
            console.error('Meal Fallback Error:', fallbackErr);
            res.status(500).json({
                error: 'Failed to analyze meal, fallback failed.',
                details: fallbackErr.message
            });
        }
    }
};

exports.deleteLastMeal = async (req, res) => {
    try {
        await pool.query('DELETE FROM meals WHERE id = (SELECT id FROM meals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1)', [req.user.id]);
        res.json({ message: 'Last meal removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
