const { pool } = require('../db/pool');

exports.getProgress = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM progress WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addProgress = async (req, res) => {
    try {
        const { weight, body_fat } = req.body;
        let photoUrl = null;

        if (req.file) {
            // If using local storage (diskStorage), req.file.path is the full path, 
            // but we want a relative URL if it's served statically.
            // req.file.filename is available in diskStorage.
            // CloudinaryStorage uses req.file.path as the URL.
            if (req.file.filename) {
                photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            } else {
                photoUrl = req.file.path;
            }
        }

        const result = await pool.query(
            'INSERT INTO progress (user_id, weight, body_fat, photo_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, weight, body_fat || null, photoUrl]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteLastProgress = async (req, res) => {
    try {
        await pool.query('DELETE FROM progress WHERE id = (SELECT id FROM progress WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1)', [req.user.id]);
        res.json({ message: 'Last progress entry removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProgress = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM progress WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        res.json({ message: 'Progress entry removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
