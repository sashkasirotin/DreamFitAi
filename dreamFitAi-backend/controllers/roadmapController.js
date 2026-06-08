const { callGeminiWithRetry } = require('../utils/aiHelper');
const { pool } = require('../db/pool');
const { generateStaticRoadmap } = require('../utils/fallbackGenerator');

exports.getLatestRoadmap = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM roadmaps WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [req.user.id]
        );
        const roadmap = result.rows[0];
        if (roadmap) {
            if (typeof roadmap.weeks === 'string') {
                try { roadmap.weeks = JSON.parse(roadmap.weeks); } catch (e) { roadmap.weeks = []; }
            }
            if (typeof roadmap.tips === 'string') {
                try { roadmap.tips = JSON.parse(roadmap.tips); } catch (e) { roadmap.tips = []; }
            }
        }
        res.json(roadmap || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.generateRoadmap = async (req, res) => {
    const { age, gender, weight, height, goal, activityLevel, dietaryPref, bodyStructure } = req.body;
    try {
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
        1. "dailyGoal": A recommended daily calorie target (integer).
        2. "weeks": An array of 4 objects, each with:
           - "title": a short week title
           - "focus": one sentence describing the week's theme
           - "bullets": an array of 3-4 concise, actionable bullet points for that week
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
            'INSERT INTO roadmaps (user_id, daily_goal, weeks, tips, is_fallback, profile) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, roadmap.dailyGoal, JSON.stringify(roadmap.weeks), JSON.stringify(roadmap.tips), false, JSON.stringify({ age, gender, weight, height, goal, activityLevel, dietaryPref, bodyStructure })]
        );

        // Auto-log initial weight if no progress entries exist
        const progressCheck = await pool.query('SELECT id FROM progress WHERE user_id = $1 LIMIT 1', [req.user.id]);
        if (progressCheck.rows.length === 0 && weight) {
            await pool.query(
                'INSERT INTO progress (user_id, weight) VALUES ($1, $2)',
                [req.user.id, weight]
            );
        }

        const savedRoadmap = saveResult.rows[0];
        if (typeof savedRoadmap.weeks === 'string') {
            try { savedRoadmap.weeks = JSON.parse(savedRoadmap.weeks); } catch (e) { savedRoadmap.weeks = []; }
        }
        if (typeof savedRoadmap.tips === 'string') {
            try { savedRoadmap.tips = JSON.parse(savedRoadmap.tips); } catch (e) { savedRoadmap.tips = []; }
        }

        res.json({ ...savedRoadmap, _usage: result.usage });
    } catch (err) {
        console.warn('Gemini Roadmap error, falling back to static calculation:', err.message);
        try {
            const roadmap = generateStaticRoadmap({ age, gender, weight, height, goal, activityLevel, dietaryPref, bodyStructure });

            // Save static fallback roadmap to database
            const saveResult = await pool.query(
                'INSERT INTO roadmaps (user_id, daily_goal, weeks, tips, is_fallback, profile) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [req.user.id, roadmap.dailyGoal, JSON.stringify(roadmap.weeks), JSON.stringify(roadmap.tips), true, JSON.stringify({ age, gender, weight, height, goal, activityLevel, dietaryPref, bodyStructure })]
            );

            // Auto-log initial weight if no progress entries exist
            const progressCheck = await pool.query('SELECT id FROM progress WHERE user_id = $1 LIMIT 1', [req.user.id]);
            if (progressCheck.rows.length === 0 && weight) {
                await pool.query(
                    'INSERT INTO progress (user_id, weight) VALUES ($1, $2)',
                    [req.user.id, weight]
                );
            }

            const savedRoadmap = saveResult.rows[0];
            if (typeof savedRoadmap.weeks === 'string') {
                try { savedRoadmap.weeks = JSON.parse(savedRoadmap.weeks); } catch (e) { savedRoadmap.weeks = []; }
            }
            if (typeof savedRoadmap.tips === 'string') {
                try { savedRoadmap.tips = JSON.parse(savedRoadmap.tips); } catch (e) { savedRoadmap.tips = []; }
            }

            res.json({ ...savedRoadmap, is_fallback: true });
        } catch (fallbackErr) {
            console.error('Roadmap Fallback Error:', fallbackErr);
            res.status(500).json({
                error: 'Failed to generate fitness roadmap, fallback failed.',
                details: fallbackErr.message
            });
        }
    }
};

exports.upgradeRoadmap = async (req, res) => {
    let roadmap;
    try {
        const result = await pool.query(
            'SELECT * FROM roadmaps WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [req.user.id]
        );

        roadmap = result.rows[0];
        if (!roadmap || !roadmap.is_fallback) {
            if (roadmap) {
                if (typeof roadmap.weeks === 'string') {
                    try { roadmap.weeks = JSON.parse(roadmap.weeks); } catch (e) { roadmap.weeks = []; }
                }
                if (typeof roadmap.tips === 'string') {
                    try { roadmap.tips = JSON.parse(roadmap.tips); } catch (e) { roadmap.tips = []; }
                }
            }
            return res.json(roadmap || null);
        }

        let profile = roadmap.profile;
        if (typeof profile === 'string') {
            try { profile = JSON.parse(profile); } catch (e) { profile = null; }
        }

        if (!profile) {
            if (typeof roadmap.weeks === 'string') {
                try { roadmap.weeks = JSON.parse(roadmap.weeks); } catch (e) { roadmap.weeks = []; }
            }
            if (typeof roadmap.tips === 'string') {
                try { roadmap.tips = JSON.parse(roadmap.tips); } catch (e) { roadmap.tips = []; }
            }
            return res.json(roadmap);
        }

        const { age, gender, weight, height, goal, activityLevel, dietaryPref, bodyStructure } = profile;

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
        1. "dailyGoal": A recommended daily calorie target (integer).
        2. "weeks": An array of 4 objects, each with:
           - "title": a short week title
           - "focus": one sentence describing the week's theme
           - "bullets": an array of 3-4 concise, actionable bullet points for that week
        3. "tips": A list of 3 personalized tips objects, each with a "title" and "description".
        
        Respond ONLY with the JSON object.`;

        const aiResult = await callGeminiWithRetry('gemini-2.5-flash', prompt);
        const jsonMatch = aiResult.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI returned an invalid response format');
        }

        const upgraded = JSON.parse(jsonMatch[0]);

        const updateResult = await pool.query(
            'UPDATE roadmaps SET daily_goal = $1, weeks = $2, tips = $3, is_fallback = false WHERE id = $4 RETURNING *',
            [upgraded.dailyGoal, JSON.stringify(upgraded.weeks), JSON.stringify(upgraded.tips), roadmap.id]
        );

        const savedRoadmap = updateResult.rows[0];
        if (typeof savedRoadmap.weeks === 'string') {
            try { savedRoadmap.weeks = JSON.parse(savedRoadmap.weeks); } catch (e) { savedRoadmap.weeks = []; }
        }
        if (typeof savedRoadmap.tips === 'string') {
            try { savedRoadmap.tips = JSON.parse(savedRoadmap.tips); } catch (e) { savedRoadmap.tips = []; }
        }

        res.json({ ...savedRoadmap, _usage: aiResult.usage, _upgraded: true });
    } catch (err) {
        console.warn('Gemini Roadmap upgrade failed:', err.message);
        if (roadmap) {
            if (typeof roadmap.weeks === 'string') {
                try { roadmap.weeks = JSON.parse(roadmap.weeks); } catch (e) { roadmap.weeks = []; }
            }
            if (typeof roadmap.tips === 'string') {
                try { roadmap.tips = JSON.parse(roadmap.tips); } catch (e) { roadmap.tips = []; }
            }
        }
        res.json(roadmap || null);
    }
};
