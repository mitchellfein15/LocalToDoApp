const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('../../database/dbConfig');

class TodoController {
  static getDb() {
    return new sqlite3.Database(dbPath);
  }

  // Get all todos
  static getAllTodos(req, res) {
    const db = TodoController.getDb();
    
    db.all('SELECT * FROM todos ORDER BY created_at DESC', (err, rows) => {
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
    
    const sql = 'INSERT INTO todos (title, description, due_date) VALUES (?, ?, ?)';
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
    const { title, description, due_date } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    
    const sql = 'UPDATE todos SET title = ?, description = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const params = [title, description || '', due_date || null, id];
    
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

}

module.exports = TodoController; 