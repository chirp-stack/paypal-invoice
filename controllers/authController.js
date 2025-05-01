const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const CONFIG = require('../config');

const SECRET = CONFIG.jwt.secret;

exports.registerAdmin = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send('Username and password are required');

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) {
            console.error(err);
            return res.status(400).send('Username already exists or database error');
        }
        res.status(201).send('Admin registered successfully');
    });
};

exports.login = (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
        if (err || !admin) return res.status(401).send('Invalid username or password');
        if (bcrypt.compareSync(password, admin.password)) {
            const token = jwt.sign({ id: admin.id }, SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Invalid username or password');
        }
    });
};

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Token required');
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(403).send('Invalid token');
        req.adminId = decoded.id;
        next();
    });
};
