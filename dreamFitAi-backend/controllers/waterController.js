const { pool } = require('../db/pool');

exports.getWaterLogs = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM water_logs WHERE user_id = $1 AND date = CURRENT_DATE',
            [req.user.id]
        );
        res.json(result.rows[0] || { amount_ml: 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateWater = async (req, res) => {
    try {
        const { amount } = req.body; // expected in ml
        const result = await pool.query(
            `INSERT INTO water_logs (user_id, date, amount_ml) 
             VALUES ($1, CURRENT_DATE, $2) 
             ON CONFLICT (user_id, date) 
             DO UPDATE SET amount_ml = water_logs.amount_ml + $2 
             RETURNING *`,
            [req.user.id, amount]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.setWater = async (req, res) => {
    try {
        const { amount } = req.body;
        const result = await pool.query(
            `INSERT INTO water_logs (user_id, date, amount_ml) 
             VALUES ($1, CURRENT_DATE, $2) 
             ON CONFLICT (user_id, date) 
             DO UPDATE SET amount_ml = $2 
             RETURNING *`,
            [req.user.id, amount]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
