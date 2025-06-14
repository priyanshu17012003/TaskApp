const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

exports.signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (user) {
                return res.status(400).json({
                    message: "User already exists",
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                });
            }

            // Hash password and create user
            const hashedPassword = await bcrypt.hash(password, 10);
            const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            
            db.run(sql, [name, email, hashedPassword], function(err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Internal server error" });
                }

                const token = jwt.sign(
                    { email, id: this.lastID },
                    process.env.key,
                    { expiresIn: "1d" }
                );

                res.status(201).json({
                    message: "User created successfully",
                    user: {
                        id: this.lastID,
                        name,
                        email
                    },
                    token
                });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid password" });
            }

            const token = jwt.sign(
                {
                    name: user.name,
                    email: user.email,
                    id: user.id
                },
                process.env.key,
                { expiresIn: "1d" }
            );

            res.status(200).json({
                message: "User logged in successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                token
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.logOut = async (req, res) => {
    try {
        res.status(200).json({
            message: "Logged out successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};