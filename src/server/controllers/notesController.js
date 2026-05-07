const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('../../database/dbConfig');

class NotesController {
  static getDb() {
    return new sqlite3.Database(dbPath);
  }

  static getAllNotes(req, res) {
    const db = NotesController.getDb();
    db.all('SELECT * FROM notes ORDER BY updated_at DESC', (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
    db.close();
  }

  static createNote(req, res) {
    const db = NotesController.getDb();
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    db.run(
      'INSERT INTO notes (title, content) VALUES (?, ?)',
      [title.trim(), content || ''],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        db.get('SELECT * FROM notes WHERE id = ?', [this.lastID], (selectErr, row) => {
          if (selectErr) {
            res.status(500).json({ error: selectErr.message });
            return;
          }
          res.status(201).json(row);
        });
      }
    );
    db.close();
  }

  static updateNote(req, res) {
    const db = NotesController.getDb();
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    db.run(
      'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title.trim(), content || '', id],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (this.changes === 0) {
          res.status(404).json({ error: 'Note not found' });
          return;
        }

        db.get('SELECT * FROM notes WHERE id = ?', [id], (selectErr, row) => {
          if (selectErr) {
            res.status(500).json({ error: selectErr.message });
            return;
          }
          res.json(row);
        });
      }
    );
    db.close();
  }

  static deleteNote(req, res) {
    const db = NotesController.getDb();
    const { id } = req.params;
    db.run('DELETE FROM notes WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Note not found' });
        return;
      }
      res.json({ message: 'Note deleted successfully' });
    });
    db.close();
  }
}

module.exports = NotesController;
