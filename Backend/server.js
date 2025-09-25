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
    console.log(`🔵 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.method === 'POST' && req.body) {
        console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Static file serving
app.use(express.static(path.join(__dirname, '../frontend'), {
    index: false
}));

// Initialize SQLite Database
const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Create tables with better error handling
function initializeDatabase() {
    const schema = fs.readFileSync('./schema.sql', 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error('❌ Error creating tables:', err);
            process.exit(1);
        } else {
            console.log('✅ Database tables ready');

            // Test database write capability
            db.run('INSERT OR IGNORE INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
                [-1, 'TEST', 'test@test.com', 'test'],
                function(err) {
                    if (err) {
                        console.error('❌ Database write test failed:', err);
                    } else {
                        console.log('✅ Database write test passed');
                        // Clean up test record
                        db.run('DELETE FROM users WHERE id = -1');
                    }
                });
        }
    });
}

function generateSessionToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Server-side validation functions
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

// ====== AUTHENTICATION ROUTES ======

// User Registration
app.post('/api/register', async (req, res) => {
    console.log('\n🟡 REGISTRATION ATTEMPT STARTED');

    const { name, email, password } = req.body;

    // Server-side validation
    console.log('🔍 Server-side validation...');

    if (!name || !email || !password) {
        console.log('❌ Missing required fields');
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    if (!isValidName(name)) {
        console.log('❌ Invalid name format');
        return res.status(400).json({
            success: false,
            message: 'Name must be 2-100 characters and contain only letters and spaces'
        });
    }

    if (!isValidEmail(email)) {
        console.log('❌ Invalid email format:', email);
        return res.status(400).json({
            success: false,
            message: 'Please enter a valid email address'
        });
    }

    if (!isValidPassword(password)) {
        console.log('❌ Invalid password - length:', password.length);
        return res.status(400).json({
            success: false,
            message: 'Password must be between 6-128 characters'
        });
    }

    console.log('✅ Server validation passed');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    try {
        // Check if user exists
        const checkUserExists = () => {
            return new Promise((resolve, reject) => {
                db.get('SELECT id FROM users WHERE email = ?', [trimmedEmail], (err, row) => {
                    if (err) {
                        console.error('❌ Database query error:', err);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
        };

        const existingUser = await checkUserExists();

        if (existingUser) {
            console.log('❌ User already exists:', trimmedEmail);
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        console.log('✅ Email is available');
        console.log('🔐 Hashing password...');

        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('✅ Password hashed successfully');

        console.log('💾 Creating user in database...');

        // Create user
        const createUser = () => {
            return new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO users (name, email, password, theme, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
                    [trimmedName, trimmedEmail, hashedPassword, 'galactic'],
                    function(err) {
                        if (err) {
                            console.error('❌ User creation failed:', err);
                            reject(err);
                        } else {
                            console.log(`✅ User created with ID: ${this.lastID}`);
                            resolve(this.lastID);
                        }
                    }
                );
            });
        };

        const userId = await createUser();

        // Create session
        console.log('🎫 Creating session...');
        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const createSession = () => {
            return new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO user_sessions (user_id, session_token, expires_at, created_at) VALUES (?, ?, ?, datetime("now"))',
                    [userId, sessionToken, expiresAt],
                    function(err) {
                        if (err) {
                            console.error('❌ Session creation error:', err);
                            reject(err);
                        } else {
                            console.log('✅ Session created successfully');
                            resolve();
                        }
                    }
                );
            });
        };

        await createSession();

        const responseData = {
            success: true,
            message: 'Account created successfully',
            user: {
                id: userId,
                name: trimmedName,
                email: trimmedEmail,
                theme: 'galactic'
            },
            sessionToken: sessionToken
        };

        console.log('📦 Response data:', responseData);
        res.json(responseData);

        console.log('🟢 REGISTRATION COMPLETED SUCCESSFULLY\n');

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create account. Please try again.'
        });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    console.log('\n🔵 LOGIN ATTEMPT STARTED');

    const { email, password } = req.body;
    console.log('📥 Login data:', { email: email, password: '***' });

    if (!email || !password) {
        console.log('❌ Missing credentials');
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    if (!isValidEmail(email)) {
        console.log('❌ Invalid email format during login');
        return res.status(400).json({
            success: false,
            message: 'Invalid email or password'
        });
    }

    const trimmedEmail = email.trim().toLowerCase();

    try {
        const findUser = () => {
            return new Promise((resolve, reject) => {
                db.get('SELECT * FROM users WHERE email = ?', [trimmedEmail], (err, user) => {
                    if (err) {
                        console.error('❌ Database error:', err);
                        reject(err);
                    } else {
                        resolve(user);
                    }
                });
            });
        };

        const user = await findUser();

        if (!user) {
            console.log('❌ User not found:', trimmedEmail);
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log('✅ User found, checking password...');

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            console.log('❌ Password mismatch');
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log('✅ Password correct, creating session...');

        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const manageSession = () => {
            return new Promise((resolve, reject) => {
                db.run('DELETE FROM user_sessions WHERE user_id = ?', [user.id], (err) => {
                    if (err) console.error('⚠️ Error clearing old sessions:', err);

                    db.run(
                        'INSERT INTO user_sessions (user_id, session_token, expires_at, created_at) VALUES (?, ?, ?, datetime("now"))',
                        [user.id, sessionToken, expiresAt],
                        function(err) {
                            if (err) {
                                console.error('❌ Session creation error:', err);
                                reject(err);
                            } else {
                                console.log('✅ Login session created');
                                resolve();
                            }
                        }
                    );
                });
            });
        };

        await manageSession();

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                theme: user.theme
            },
            sessionToken: sessionToken
        });

        console.log('🟢 LOGIN COMPLETED SUCCESSFULLY\n');

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

// Authentication middleware
function authenticateUser(req, res, next) {
    const sessionToken = req.headers['authorization'];

    if (!sessionToken) {
        return res.status(401).json({
            success: false,
            message: 'No session token provided'
        });
    }

    db.get(
        `SELECT u.*, s.expires_at 
         FROM users u 
         JOIN user_sessions s ON u.id = s.user_id 
         WHERE s.session_token = ? AND s.expires_at > datetime('now')`,
        [sessionToken],
        (err, user) => {
            if (err) {
                console.error('Auth check error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Authentication error'
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired session'
                });
            }

            req.user = user;
            next();
        }
    );
}

// ====== USER ROUTES ======

// Get current user info
app.get('/api/user', authenticateUser, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            theme: req.user.theme
        }
    });
});

// Update user theme
app.put('/api/user/theme', authenticateUser, (req, res) => {
    console.log('\n🎨 THEME UPDATE REQUEST');
    const { theme } = req.body;

    if (!theme || !['galactic', 'corporate', 'nature', 'dark'].includes(theme)) {
        console.log('❌ Invalid theme:', theme);
        return res.status(400).json({
            success: false,
            message: 'Invalid theme'
        });
    }

    console.log(`🎨 Updating theme to: ${theme} for user: ${req.user.id}`);

    db.run(
        'UPDATE users SET theme = ? WHERE id = ?',
        [theme, req.user.id],
        function(err) {
            if (err) {
                console.error('❌ Theme update failed:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update theme'
                });
            }

            console.log('✅ Theme updated successfully');
            res.json({
                success: true,
                message: 'Theme updated successfully'
            });
        }
    );
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

// ====== TASK ROUTES ======

// Get all tasks for authenticated user
app.get('/api/tasks', authenticateUser, (req, res) => {
    console.log('\n📋 GETTING TASKS for user:', req.user.id);

    db.all(
        'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id],
        (err, tasks) => {
            if (err) {
                console.error('❌ Error fetching tasks:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch tasks'
                });
            }

            console.log(`✅ Found ${tasks.length} tasks`);
            res.json({
                success: true,
                tasks: tasks
            });
        }
    );
});

// Create new task
app.post('/api/tasks', authenticateUser, (req, res) => {
    console.log('\n📝 CREATING TASK for user:', req.user.id);

    const { title, description, priority, dueDate, type } = req.body;

    if (!title || title.trim().length === 0) {
        console.log('❌ Missing task title');
        return res.status(400).json({
            success: false,
            message: 'Task title is required'
        });
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
        console.log('❌ Invalid priority:', priority);
        return res.status(400).json({
            success: false,
            message: 'Invalid priority level'
        });
    }

    if (!['individual', 'group'].includes(type)) {
        console.log('❌ Invalid task type:', type);
        return res.status(400).json({
            success: false,
            message: 'Invalid task type'
        });
    }

    console.log('📝 Task data:', {
        title: title.trim(),
        description: description ? description.trim() : null,
        priority,
        dueDate: dueDate || null,
        type
    });

    db.run(
        `INSERT INTO tasks (user_id, title, description, priority, due_date, type, completed, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
            req.user.id,
            title.trim(),
            description ? description.trim() : null,
            priority,
            dueDate || null,
            type,
            false
        ],
        function(err) {
            if (err) {
                console.error('❌ Task creation failed:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create task'
                });
            }

            const taskId = this.lastID;
            console.log(`✅ Task created with ID: ${taskId}`);

            // Fetch the created task to return it
            db.get(
                'SELECT * FROM tasks WHERE id = ?',
                [taskId],
                (err, task) => {
                    if (err) {
                        console.error('❌ Error fetching created task:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Task created but failed to fetch'
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: 'Task created successfully',
                        task: task
                    });
                }
            );
        }
    );
});

// Update task
app.put('/api/tasks/:id', authenticateUser, (req, res) => {
    console.log('\n📝 UPDATING TASK:', req.params.id, 'for user:', req.user.id);

    const taskId = parseInt(req.params.id);
    const { title, description, priority, dueDate, type, completed } = req.body;

    // First, verify task belongs to user
    db.get(
        'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
        [taskId, req.user.id],
        (err, task) => {
            if (err) {
                console.error('❌ Error checking task ownership:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (!task) {
                console.log('❌ Task not found or not owned by user');
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            // Build update query dynamically based on provided fields
            const updates = [];
            const values = [];

            if (title !== undefined) {
                updates.push('title = ?');
                values.push(title.trim());
            }
            if (description !== undefined) {
                updates.push('description = ?');
                values.push(description ? description.trim() : null);
            }
            if (priority !== undefined && ['low', 'medium', 'high'].includes(priority)) {
                updates.push('priority = ?');
                values.push(priority);
            }
            if (dueDate !== undefined) {
                updates.push('due_date = ?');
                values.push(dueDate || null);
            }
            if (type !== undefined && ['individual', 'group'].includes(type)) {
                updates.push('type = ?');
                values.push(type);
            }
            if (completed !== undefined) {
                updates.push('completed = ?');
                values.push(completed ? 1 : 0);
            }

            if (updates.length === 0) {
                console.log('❌ No valid fields to update');
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update'
                });
            }

            values.push(taskId);

            const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;

            db.run(query, values, function(err) {
                if (err) {
                    console.error('❌ Task update failed:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update task'
                    });
                }

                console.log('✅ Task updated successfully');

                // Return updated task
                db.get(
                    'SELECT * FROM tasks WHERE id = ?',
                    [taskId],
                    (err, updatedTask) => {
                        if (err) {
                            console.error('❌ Error fetching updated task:', err);
                            return res.status(500).json({
                                success: false,
                                message: 'Task updated but failed to fetch'
                            });
                        }

                        res.json({
                            success: true,
                            message: 'Task updated successfully',
                            task: updatedTask
                        });
                    }
                );
            });
        }
    );
});

// Delete task
app.delete('/api/tasks/:id', authenticateUser, (req, res) => {
    console.log('\n🗑️ DELETING TASK:', req.params.id, 'for user:', req.user.id);

    const taskId = parseInt(req.params.id);

    // Verify task belongs to user and delete
    db.run(
        'DELETE FROM tasks WHERE id = ? AND user_id = ?',
        [taskId, req.user.id],
        function(err) {
            if (err) {
                console.error('❌ Task deletion failed:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete task'
                });
            }

            if (this.changes === 0) {
                console.log('❌ Task not found or not owned by user');
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            console.log('✅ Task deleted successfully');
            res.json({
                success: true,
                message: 'Task deleted successfully'
            });
        }
    );
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
    db.all('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC', (err, users) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        db.all('SELECT COUNT(*) as count FROM user_sessions WHERE expires_at > datetime("now")', (err2, sessions) => {
            if (err2) {
                return res.status(500).json({ error: err2.message });
            }

            db.all('SELECT COUNT(*) as count FROM tasks', (err3, tasks) => {
                if (err3) {
                    return res.status(500).json({ error: err3.message });
                }

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
    console.log('🏠 Serving landing page');
    res.sendFile(path.join(__dirname, '../frontend/landing.html'));
});

app.get('/login', (req, res) => {
    console.log('🔐 Serving login page');
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/signup', (req, res) => {
    console.log('📝 Serving signup page');
    res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

app.get('/dashboard', authenticateUser, (req, res) => {
    console.log('📊 Serving dashboard page');
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('/favicon.ico', (req, res) => {
    res.status(204).send();
});

app.get('*', (req, res) => {
    console.log(`❓ Unmatched route: ${req.path}`);
    res.status(404).send(`Route not found: ${req.path}`);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🏠 Landing: http://localhost:${PORT}`);
    console.log(`🔐 Login: http://localhost:${PORT}/login`);
    console.log(`📝 Signup: http://localhost:${PORT}/signup`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`🔧 Debug: http://localhost:${PORT}/api/debug`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔴 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('✅ Database connection closed');
        }
    });
    process.exit(0);
});