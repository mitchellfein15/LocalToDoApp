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
          due_date TEXT,
          completed BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          // Create categories table
          db.run(`
            CREATE TABLE IF NOT EXISTS categories (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL UNIQUE,
              color TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) {
              reject(err);
            } else {
              // Add category_id column to todos table if it doesn't exist
              db.run(`ALTER TABLE todos ADD COLUMN category_id INTEGER`, (err) => {
                // Ignore error if column already exists
                
                // Add foreign key constraint
                db.run(`CREATE INDEX IF NOT EXISTS idx_todos_category_id ON todos(category_id)`, (err) => {
                  // Ignore error if index already exists
                  
                  // Add due_date column if it doesn't exist (for existing databases)
                  db.run(`ALTER TABLE todos ADD COLUMN due_date TEXT`, (err) => {
                    // Ignore error if column already exists
                    
                    // Check if we need to migrate existing DATE data to TEXT
                    db.get("PRAGMA table_info(todos)", (err, rows) => {
                      if (!err) {
                        // If due_date column exists and is DATE type, migrate it
                        db.run(`UPDATE todos SET due_date = due_date WHERE due_date IS NOT NULL`, (err) => {
                          // This will ensure the date is stored as TEXT
                          resolve(db);
                        });
                      } else {
                        resolve(db);
                      }
                    });
                  });
                });
              });
            }
          });
        }
      });
    });
  });
}

module.exports = { initDatabase, dbPath }; 