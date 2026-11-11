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
      `SELECT day AS date, count
       FROM productivity_days
       WHERE strftime('%Y', day) = ?
         AND count > 0
       ORDER BY day ASC`,
      [String(requestedYear)],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json(rows || []);
        }
        db.close();
      }
    );
  }

  static getYears(req, res) {
    const db = StatsController.getDb();
    const currentYear = new Date().getFullYear();

    db.all(
      `SELECT DISTINCT CAST(strftime('%Y', day) AS INTEGER) AS year
       FROM productivity_days
       WHERE count > 0
       ORDER BY year ASC`,
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          db.close();
          return;
        }

        const years = new Set((rows || []).map((row) => Number(row.year)));
        years.add(currentYear);
        const sorted = Array.from(years).sort((a, b) => a - b);
        res.json(sorted);
        db.close();
      }
    );
  }

  static resetStats(req, res) {
    const db = StatsController.getDb();

    db.serialize(() => {
      db.run('DELETE FROM productivity_days', function(deleteErr) {
        if (deleteErr) {
          res.status(500).json({ error: deleteErr.message });
          db.close();
          return;
        }

        const clearedDays = this.changes;

        db.run(
          `UPDATE todos SET completed_at = NULL WHERE completed = 1`,
          function(updateErr) {
            if (updateErr) {
              res.status(500).json({ error: updateErr.message });
            } else {
              res.json({
                message: 'Statistics reset successfully',
                clearedDays,
                changes: this.changes,
              });
            }
            db.close();
          }
        );
      });
    });
  }
}

module.exports = StatsController;
