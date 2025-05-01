const db = require('../database');

exports.createSubscription = (req, res) => {
    const { customer_id, description, price } = req.body;
    db.run('INSERT INTO subscriptions (customer_id, description, price) VALUES (?, ?, ?)', [customer_id, description, price], function(err) {
        if (err) return res.status(500).send(err);
        res.json({ id: this.lastID });
    });
};