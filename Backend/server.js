const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.method === 'POST' && req.body) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Static file serving
app.use(express.static(path.join(__dirname, '../Frontend'), { index: false }));
app.use('/Dashboard', express.static(path.join(__dirname, '../Frontend/Dashboard')));

// Initialize SQLite Database
const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Create tables
function initializeDatabase() {
    const schema = fs.readFileSync('./schema.sql', 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error creating tables:', err);
            process.exit(1);
        } else {
            console.log('Database tables ready');
            db.run('INSERT OR IGNORE INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
                [-1, 'TEST', 'test@test.com', 'test'],
                function(err) {
                    if (err) {
                        console.error('Database write test failed:', err);
                    } else {
                        console.log('Database write test passed');
                        db.run('DELETE FROM users WHERE id = -1');
                    }
                });
        }
    });
}

function generateSessionToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length >= 5 && email.length <= 254;
}

function isValidPassword(password) {
    return typeof password === 'string' && password.length >= 6 && password.length <= 128;
}

function isValidName(name) {
    return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 100 && /^[a-zA-Z\s]+$/.test(name.trim());
}

// User Registration
app.post('/api/register', async (req, res) => {
    console.log('\nREGISTRATION ATTEMPT STARTED');
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!isValidName(name) || !isValidEmail(email) || !isValidPassword(password)) {
        return res.status(400).json({ success: false, message: 'Invalid input data' });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    try {
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [trimmedEmail], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const userId = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (name, email, password, theme, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
                [trimmedName, trimmedEmail, hashedPassword, 'galactic'],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO user_sessions (user_id, session_token, expires_at, created_at) VALUES (?, ?, ?, datetime("now"))',
                [userId, sessionToken, expiresAt],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            success: true,
            message: 'Account created successfully',
            user: { id: userId, name: trimmedName, email: trimmedEmail, theme: 'galactic' },
            sessionToken: sessionToken
        });

        console.log('REGISTRATION COMPLETED\n');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Failed to create account' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    console.log('\nLOGIN ATTEMPT STARTED');
    const { email, password } = req.body;

    if (!email || !password || !isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    try {
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [trimmedEmail], (err, user) => {
                if (err) reject(err);
                else resolve(user);
            });
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        await new Promise((resolve, reject) => {
            db.run('DELETE FROM user_sessions WHERE user_id = ?', [user.id], (err) => {
                if (err) console.error('Error clearing sessions:', err);
                db.run(
                    'INSERT INTO user_sessions (user_id, session_token, expires_at, created_at) VALUES (?, ?, ?, datetime("now"))',
                    [user.id, sessionToken, expiresAt],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        });

        res.json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email, theme: user.theme },
            sessionToken: sessionToken
        });

        console.log('LOGIN COMPLETED\n');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Authentication middleware
function authenticateUser(req, res, next) {
    const sessionToken = req.headers['authorization'];

    if (!sessionToken) {
        return res.status(401).json({ success: false, message: 'No session token' });
    }

    db.get(
        `SELECT u.*, s.expires_at FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.session_token = ? AND s.expires_at > datetime('now')`,
        [sessionToken],
        (err, user) => {
            if (err) {
                console.error('Auth error:', err);
                return res.status(500).json({ success: false, message: 'Authentication error' });
            }
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid session' });
            }
            req.user = user;
            next();
        }
    );
}

// Get current user
app.get('/api/user', authenticateUser, (req, res) => {
    res.json({
        success: true,
        user: { id: req.user.id, name: req.user.name, email: req.user.email, theme: req.user.theme }
    });
});

// Update theme
app.put('/api/user/theme', authenticateUser, (req, res) => {
    const { theme } = req.body;

    if (!theme || !['galactic', 'corporate', 'nature', 'dark', 'sky', 'neon'].includes(theme)) {
        return res.status(400).json({ success: false, message: 'Invalid theme' });
    }

    db.run('UPDATE users SET theme = ? WHERE id = ?', [theme, req.user.id], function(err) {
        if (err) {
            console.error('Theme update failed:', err);
            return res.status(500).json({ success: false, message: 'Failed to update theme' });
        }
        console.log('Theme updated successfully');
        res.json({ success: true, message: 'Theme updated successfully' });
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    const sessionToken = req.headers['authorization'];
    if (sessionToken) {
        db.run('DELETE FROM user_sessions WHERE session_token = ?', [sessionToken], (err) => {
            if (err) console.error('Logout error:', err);
        });
    }
    res.json({ success: true, message: 'Logged out successfully' });
});

// Load task routes
require('./servertasks')(app, db, authenticateUser);

// Debug endpoint
app.get('/api/debug', (req, res) => {
    db.all('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC', (err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all('SELECT COUNT(*) as count FROM user_sessions WHERE expires_at > datetime("now")', (err2, sessions) => {
            if (err2) return res.status(500).json({ error: err2.message });
            db.all('SELECT COUNT(*) as count FROM tasks', (err3, tasks) => {
                if (err3) return res.status(500).json({ error: err3.message });
                res.json({
                    users: users,
                    activeSessionCount: sessions[0].count,
                    totalTasks: tasks[0].count,
                    timestamp: new Date().toISOString()
                });
            });
        });
    });
});

// Frontend routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/landing.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/signup.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/Dashboard/dashboard.html'));
});

app.get('/favicon.ico', (req, res) => {
    res.status(204).send();
});

// 404 handler
app.use((req, res) => {
    res.status(404).send(`Route not found: ${req.path}`);
});

// Start server
app.listen(PORT, () => {
    console.log(`\nServer running at http://localhost:${PORT}`);
    console.log(`Landing: http://localhost:${PORT}`);
    console.log(`Login: http://localhost:${PORT}/login`);
    console.log(`Signup: http://localhost:${PORT}/signup`);
    console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`Debug: http://localhost:${PORT}/api/debug\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close((err) => {
        if (err) console.error(err.message);
        else console.log('Database connection closed');
    });
    process.exit(0);
});