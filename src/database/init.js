const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('./dbConfig');

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      db.run(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          due_date DATE,
          completed BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          // Add due_date column if it doesn't exist (for existing databases)
          db.run(`ALTER TABLE todos ADD COLUMN due_date DATE`, (err) => {
            // Ignore error if column already exists
            resolve(db);
          });
        }
      });
    });
  });
}

module.exports = { initDatabase, dbPath }; 