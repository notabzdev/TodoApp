-- User accounts table
CREATE TABLE IF NOT EXISTS users (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     email TEXT UNIQUE NOT NULL,
                                     password TEXT NOT NULL,
                                     name TEXT NOT NULL,
                                     theme TEXT DEFAULT 'cosmic',
                                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table (for your future features)
CREATE TABLE IF NOT EXISTS organizations (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name TEXT NOT NULL,
                                             invite_code TEXT UNIQUE NOT NULL,
                                             created_by INTEGER NOT NULL,
                                             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             FOREIGN KEY (created_by) REFERENCES users(id)
    );

-- User sessions for login tracking
CREATE TABLE IF NOT EXISTS user_sessions (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             user_id INTEGER NOT NULL,
                                             session_token TEXT UNIQUE NOT NULL,
                                             expires_at DATETIME NOT NULL,
                                             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             FOREIGN KEY (user_id) REFERENCES users(id)
    );

-- Tasks table - NEW
CREATE TABLE IF NOT EXISTS tasks (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     user_id INTEGER NOT NULL,
                                     title TEXT NOT NULL,
                                     description TEXT,
                                     completed BOOLEAN DEFAULT FALSE,
                                     priority TEXT DEFAULT 'medium',
                                     type TEXT DEFAULT 'individual',
                                     due_date DATETIME,
                                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                     FOREIGN KEY (user_id) REFERENCES users(id)
    );