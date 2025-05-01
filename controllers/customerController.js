const db = require('../database');

exports.createCustomer = (req, res) => {
    const { name, email } = req.body;
    db.run('INSERT INTO customers (name, email) VALUES (?, ?)', [name, email], function(err) {
        if (err) return res.status(500).send(err);
        res.json({ id: this.lastID });
    });
};