const { callGeminiWithRetry } = require('../utils/aiHelper');
const { pool } = require('../db/pool');

exports.getLatestRoadmap = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM roadmaps WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [req.user.id]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.generateRoadmap = async (req, res) => {
    try {
        const { age, gender, weight, height, goal, activityLevel, dietaryPref, bodyStructure } = req.body;

        const prompt = `As a professional fitness and nutrition consultant, create a personalized 4-week weight loss roadmap for a user with the following profile:
        - Gender: ${gender}
        - Age: ${age}
        - Current Weight: ${weight}kg
        - Height: ${height}cm
        - Body Structure: ${bodyStructure}
        - Goal: ${goal}
        - Activity Level: ${activityLevel}
        - Dietary Preferences: ${dietaryPref}

        Provide the response in a structured JSON format with:
        1. "dailyGoal": A recommended daily calorie target.
        2. "weeks": An array of 4 objects, each with a "title" and "focus" description.
        3. "tips": A list of 3 personalized tips objects, each with a "title" and "description".
        
        Respond ONLY with the JSON object.`;

        const result = await callGeminiWithRetry('gemini-2.5-flash', prompt);
        const responseText = result.text;

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI returned an invalid response format');
        }

        const roadmap = JSON.parse(jsonMatch[0]);

        // Save to database
        const saveResult = await pool.query(
            'INSERT INTO roadmaps (user_id, daily_goal, weeks, tips) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, roadmap.dailyGoal, JSON.stringify(roadmap.weeks), JSON.stringify(roadmap.tips)]
        );

        res.json({ ...saveResult.rows[0], _usage: result.usage });
    } catch (err) {
        console.error('Gemini Roadmap error:', err);
        res.status(500).json({ error: 'Failed to generate roadmap', details: err.message });
    }
};
