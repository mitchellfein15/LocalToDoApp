const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('../../database/dbConfig');

class StatsController {
  static getDb() {
    return new sqlite3.Database(dbPath);
  }

  static getHeatmap(req, res) {
    const db = StatsController.getDb();
    const requestedYear = Number.parseInt(req.query.year, 10) || new Date().getFullYear();

    db.all(
      `SELECT DATE(completed_at) AS date, COUNT(*) AS count
       FROM todos
       WHERE completed = 1
         AND completed_at IS NOT NULL
         AND strftime('%Y', completed_at) = ?
       GROUP BY DATE(completed_at)
       ORDER BY DATE(completed_at) ASC`,
      [String(requestedYear)],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows || []);
      }
    );

    db.close();
  }

  static resetStats(req, res) {
    const db = StatsController.getDb();
  
    db.run(
      `UPDATE todos SET completed_at = NULL WHERE completed = 1`,
      function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Statistics reset successfully', changes: this.changes });
      }
    );

    db.close();
  }
}

module.exports = StatsController;
