const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const userRoute = require('./routes/user-route');
const db = require('./database/db');
const fs = require('fs');
const path = require('path');

const app = express();
dotenv.config();

const schemaPath = path.resolve(__dirname, '../shared_database/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.serialize(() => {
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing database:', err);
        } else {
            console.log('Database initialized successfully');
        }
    });
});

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
const port = process.env.port;

// Initialize database tables
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

app.use('/api', userRoute);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});