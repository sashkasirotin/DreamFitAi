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
        const { description, calories, protein, is_fallback } = req.body;
        let imageUrl = null;

        if (req.file) {
            if (req.file.filename) {
                imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            } else {
                imageUrl = req.file.path;
            }
        }
        
        const result = await pool.query(
            'INSERT INTO meals (user_id, description, calories, protein, image_url, is_fallback) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, description, calories, protein, imageUrl, is_fallback || false]
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
        res.json({ ...analysis, _usage: result.usage, is_fallback: false });
    } catch (err) {
        console.warn('Gemini Meal Analysis error, falling back to static estimator:', err.message);
        try {
            const staticAnalysis = generateStaticMealAnalysis(description);
            res.json({ ...staticAnalysis, is_fallback: true });
        } catch (fallbackErr) {
            console.error('Meal Fallback Error:', fallbackErr);
            res.status(500).json({
                error: 'Failed to analyze meal, fallback failed.',
                details: fallbackErr.message
            });
        }
    }
};

exports.upgradeMeals = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM meals WHERE user_id = $1 AND is_fallback = true',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.json([]);
        }

        const upgradedMeals = [];
        for (const meal of result.rows) {
            try {
                const promptParts = [{ text: `Analyze this meal (User description: "${meal.description}"). 
                Estimate the total calories and protein content in grams, and provide a brief breakdown of why. 
                Respond ONLY in JSON format: { "description": "short name of meal", "calories": number, "protein": number, "breakdown": "brief text" }.` }];

                const aiResult = await callGeminiWithRetry('gemini-2.5-flash', promptParts);
                const jsonMatch = aiResult.text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const analysis = JSON.parse(jsonMatch[0]);
                    
                    const updateResult = await pool.query(
                        'UPDATE meals SET description = $1, calories = $2, protein = $3, ai_breakdown = $4, is_fallback = false WHERE id = $5 RETURNING *',
                        [analysis.description || meal.description, Math.round(analysis.calories), Math.round(analysis.protein || 0), analysis.breakdown, meal.id]
                    );
                    upgradedMeals.push(updateResult.rows[0]);
                }
            } catch (err) {
                console.warn(`[AI-UPGRADE-FAILED] Could not upgrade meal ID ${meal.id}:`, err.message);
            }
        }
        res.json(upgradedMeals);
    } catch (err) {
        console.error('Upgrade meals error:', err);
        res.status(500).json({ error: err.message });
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
