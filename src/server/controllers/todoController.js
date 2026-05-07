const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('../../database/dbConfig');

class TodoController {
  static getDb() {
    return new sqlite3.Database(dbPath);
  }

  // Get all todos
  static getAllTodos(req, res) {
    const db = TodoController.getDb();
    const includeCompleted = req.query.includeCompleted === 'true';
    const sql = includeCompleted
      ? 'SELECT * FROM todos ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC'
      : 'SELECT * FROM todos WHERE completed = 0 ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC';

    db.all(sql, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
    
    db.close();
  }

  // Get single todo by ID
  static getTodoById(req, res) {
    const db = TodoController.getDb();
    const { id } = req.params;
    
    db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }
      res.json(row);
    });
    
    db.close();
  }

  // Create new todo
  static createTodo(req, res) {
    const db = TodoController.getDb();
    const { title, description, due_date } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    
    const sql = 'INSERT INTO todos (title, description, due_date, completed, completed_at) VALUES (?, ?, ?, 0, NULL)';
    const params = [title, description || '', due_date || null];
    
    db.run(sql, params, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Get the created todo
      db.get('SELECT * FROM todos WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    });
    
    db.close();
  }

  // Update todo
  static updateTodo(req, res) {
    const db = TodoController.getDb();
    const { id } = req.params;
    const { title, description, due_date, completed } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    
    const isCompleted = Boolean(completed);
    const sql = `UPDATE todos
      SET title = ?, description = ?, due_date = ?, completed = ?, completed_at = CASE
        WHEN ? = 1 AND completed_at IS NULL THEN CURRENT_TIMESTAMP
        WHEN ? = 0 THEN NULL
        ELSE completed_at
      END, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`;
    const params = [title, description || '', due_date || null, isCompleted ? 1 : 0, isCompleted ? 1 : 0, isCompleted ? 1 : 0, id];
    
    db.run(sql, params, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }
      
      // Get the updated todo
      db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    });
    
    db.close();
  }

  // Delete todo
  static deleteTodo(req, res) {
    const db = TodoController.getDb();
    const { id } = req.params;
    
    db.run('DELETE FROM todos WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }
      
      res.json({ message: 'Todo deleted successfully' });
    });
    
    db.close();
  }

  static completeTodo(req, res) {
    const db = TodoController.getDb();
    const { id } = req.params;

    db.run(
      `UPDATE todos
       SET completed = 1, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [id],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        if (this.changes === 0) {
          res.status(404).json({ error: 'Todo not found' });
          return;
        }

        db.get('SELECT * FROM todos WHERE id = ?', [id], (selectErr, row) => {
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
}

module.exports = TodoController; 