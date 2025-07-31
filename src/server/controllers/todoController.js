const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('../../database/dbConfig');

class TodoController {
  static getDb() {
    return new sqlite3.Database(dbPath);
  }

  // Get all todos
  static getAllTodos(req, res) {
    const db = TodoController.getDb();
    
    db.all(`
      SELECT t.*, c.name as category_name, c.color as category_color 
      FROM todos t 
      LEFT JOIN categories c ON t.category_id = c.id 
      ORDER BY t.created_at DESC
    `, (err, rows) => {
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
    
    db.get(`
      SELECT t.*, c.name as category_name, c.color as category_color 
      FROM todos t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.id = ?
    `, [id], (err, row) => {
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
    const { title, description, due_date, category_id } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    
    const sql = 'INSERT INTO todos (title, description, due_date, category_id) VALUES (?, ?, ?, ?)';
    const params = [title, description || '', due_date || null, category_id || null];
    
    db.run(sql, params, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Get the created todo with category info
      db.get(`
        SELECT t.*, c.name as category_name, c.color as category_color 
        FROM todos t 
        LEFT JOIN categories c ON t.category_id = c.id 
        WHERE t.id = ?
      `, [this.lastID], (err, row) => {
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
    const { title, description, due_date, category_id } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    
    const sql = 'UPDATE todos SET title = ?, description = ?, due_date = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const params = [title, description || '', due_date || null, category_id || null, id];
    
    db.run(sql, params, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }
      
      // Get the updated todo with category info
      db.get(`
        SELECT t.*, c.name as category_name, c.color as category_color 
        FROM todos t 
        LEFT JOIN categories c ON t.category_id = c.id 
        WHERE t.id = ?
      `, [id], (err, row) => {
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

  // Toggle todo completion
  static toggleTodo(req, res) {
    const db = TodoController.getDb();
    const { id } = req.params;
    
    // First get the current todo
    db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!row) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }
      
      // Toggle the completed status
      const newCompleted = row.completed ? 0 : 1;
      
      db.run('UPDATE todos SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
        [newCompleted, id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Get the updated todo with category info
        db.get(`
          SELECT t.*, c.name as category_name, c.color as category_color 
          FROM todos t 
          LEFT JOIN categories c ON t.category_id = c.id 
          WHERE t.id = ?
        `, [id], (err, updatedRow) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(updatedRow);
        });
      });
    });
    
    db.close();
  }
}

module.exports = TodoController; 