const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('./dbConfig');

function runStatement(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function getOne(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

async function backfillProductivityDays(db) {
  const existing = await getOne(db, 'SELECT COUNT(*) AS total FROM productivity_days');
  if (existing && Number(existing.total) > 0) {
    return;
  }

  await runStatement(
    db,
    `INSERT INTO productivity_days (day, count)
     SELECT DATE(completed_at), COUNT(*)
     FROM todos
     WHERE completed = 1 AND completed_at IS NOT NULL
     GROUP BY DATE(completed_at)`
  );
}

async function ensureTodoColumns(db) {
  const optionalColumns = [
    'ALTER TABLE todos ADD COLUMN due_date TEXT',
    'ALTER TABLE todos ADD COLUMN completed BOOLEAN DEFAULT 0',
    'ALTER TABLE todos ADD COLUMN completed_at DATETIME'
  ];

  for (const statement of optionalColumns) {
    try {
      // Existing databases may already have these columns.
      await runStatement(db, statement);
    } catch (err) {
      if (!String(err.message).includes('duplicate column name')) {
        throw err;
      }
    }
  }
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        await runStatement(
          db,
          `CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            due_date TEXT,
            completed BOOLEAN DEFAULT 0,
            completed_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`
        );

        await ensureTodoColumns(db);

        await runStatement(
          db,
          `CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`
        );

        await runStatement(
          db,
          `CREATE TABLE IF NOT EXISTS productivity_days (
            day TEXT PRIMARY KEY,
            count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0)
          )`
        );

        await backfillProductivityDays(db);

        resolve(db);
      } catch (dbError) {
        reject(dbError);
      }
    });
  });
}

module.exports = { initDatabase, dbPath };