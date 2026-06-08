const { callGeminiWithRetry } = require("../utils/aiHelper");
const { pool } = require("../db/pool");
const { generateStaticStory } = require("../utils/fallbackGenerator");

exports.generateFitnessStory = async (req, res) => {
    let progressResult = { rows: [] };
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // If API key is missing entirely, jump directly to the fallback flow
            throw new Error('Valid GEMINI_API_KEY is missing');
        }

        // Fetch user's progress entries with photos
        progressResult = await pool.query(
            'SELECT * FROM progress WHERE user_id = $1 AND photo_url IS NOT NULL ORDER BY created_at ASC LIMIT 5',
            [req.user.id]
        );

        if (progressResult.rows.length === 0) {
            return res.status(400).json({ error: 'You need at least one progress photo to generate a story.' });
        }

        const prompt = `You are an inspiring fitness biographer and data analyst. You will be provided with a series of progress photos and corresponding weight data.

        Your Tasks:
        1. Image Analysis: For each photo, comment on the user's progress and determination shown.
        2. Narrative Construction: Write a cohesive "Fitness Journey Story" that highlights their consistency and growth. Split it into "Story Segments" that fit each photo.
        3. Motivation: Identify "Wins" (e.g., weight loss, consistency).

        Return only a valid JSON object with the following structure:
        {
          "title": "string",
          "full_story": "string",
          "segments": [
            {
              "photo_url": "string (match from input)",
              "caption": "string",
              "segment_text": "string"
            }
          ],
          "key_wins": ["string"]
        }`;

        const parts = [{ text: prompt }];

        for (const entry of progressResult.rows) {
            try {
                const response = await fetch(entry.photo_url);
                if (!response.ok) {
                    console.error(`Failed to fetch image: ${entry.photo_url} - Status: ${response.status}`);
                    continue;
                }
                
                const contentType = response.headers.get('content-type') || 'image/jpeg';
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                // Only add if we have actual data
                if (buffer.length > 0) {
                    parts.push({
                        inlineData: {
                            data: buffer.toString('base64'),
                            mimeType: contentType.split(';')[0] // Ensure we get just the mime type
                        }
                    });
                    
                    parts.push({ text: `Data for this photo: Date: ${new Date(entry.created_at).toLocaleDateString()}, Weight: ${entry.weight}kg` });
                }
            } catch (e) {
                console.error("Failed to process image for Gemini:", entry.photo_url, e.message);
            }
        }

        const result = await callGeminiWithRetry('gemini-2.5-flash', { contents: [{ role: "user", parts }] });
        const responseText = result.text;
        
        // Improved JSON extraction in case Gemini adds markdown or conversational text
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI returned an invalid response format');
        }
        
        const story = JSON.parse(jsonMatch[0]);
        res.json({ ...story, _usage: result.usage });
    } catch (err) {
        console.warn('Gemini Story error, falling back to static story generator:', err.message);
        try {
            // If progressResult wasn't loaded (e.g. if we jumped straight because of missing key), fetch it here
            if (progressResult.rows.length === 0 && req.user && req.user.id) {
                progressResult = await pool.query(
                    'SELECT * FROM progress WHERE user_id = $1 AND photo_url IS NOT NULL ORDER BY created_at ASC LIMIT 5',
                    [req.user.id]
                );
            }
            
            const staticStory = generateStaticStory(progressResult.rows);
            res.json(staticStory);
        } catch (fallbackErr) {
            console.error('Story Fallback Error:', fallbackErr);
            res.status(500).json({
                error: 'Failed to generate fitness journey story, fallback failed.',
                details: fallbackErr.message
            });
        }
    }
};
