//Run to check database
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('Connected to database successfully');
});

// Check if tables exist
console.log('\n=== CHECKING TABLES ===');
db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, tables) => {
    if (err) {
        console.error('Error getting tables:', err);
        return;
    }

    console.log('Tables found:', tables.map(t => t.name));

    // Check users table
    db.all('SELECT COUNT(*) as count FROM users', (err, result) => {
        if (err) {
            console.error('Error checking users table:', err);
        } else {
            console.log(`Users table has ${result[0].count} records`);
        }
    });

    // Check sessions table
    db.all('SELECT COUNT(*) as count FROM user_sessions', (err, result) => {
        if (err) {
            console.error('Error checking sessions table:', err);
        } else {
            console.log(`Sessions table has ${result[0].count} records`);
        }
    });

    // Show all users (without passwords)
    console.log('\n=== ALL USERS ===');
    db.all('SELECT id, name, email, theme, created_at FROM users', (err, users) => {
        if (err) {
            console.error('Error getting users:', err);
        } else {
            if (users.length === 0) {
                console.log('No users found in database');
            } else {
                users.forEach(user => {
                    console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Created: ${user.created_at}`);
                });
            }
        }
    });

    // Show active sessions
    console.log('\n=== ACTIVE SESSIONS ===');
    db.all(`SELECT s.id, s.user_id, u.email, s.expires_at 
            FROM user_sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.expires_at > datetime('now')`, (err, sessions) => {
        if (err) {
            console.error('Error getting sessions:', err);
        } else {
            if (sessions.length === 0) {
                console.log('No active sessions');
            } else {
                sessions.forEach(session => {
                    console.log(`Session ID: ${session.id}, User: ${session.email}, Expires: ${session.expires_at}`);
                });
            }
        }

        // Close database
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('\nDatabase connection closed');
            }
        });
    });
});