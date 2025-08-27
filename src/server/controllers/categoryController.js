const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('../../database/dbConfig');

class CategoryController {
  static getAllCategories(req, res) {
    const db = new sqlite3.Database(dbPath);
    
    db.all('SELECT * FROM categories ORDER BY name', (err, rows) => {
      db.close();
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  }

  static getCategoryById(req, res) {
    const db = new sqlite3.Database(dbPath);
    const { id } = req.params;
    
    db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
      db.close();
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.json(row);
    });
  }

  static createCategory(req, res) {
    const db = new sqlite3.Database(dbPath);
    const { name, color } = req.body;
    
    if (!name || !color) {
      db.close();
      res.status(400).json({ error: 'Name and color are required' });
      return;
    }
    
    db.run('INSERT INTO categories (name, color) VALUES (?, ?)', [name, color], function(err) {
      if (err) {
        db.close();
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(409).json({ error: 'Category name already exists' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }
      
      // Get the created category
      db.get('SELECT * FROM categories WHERE id = ?', [this.lastID], (err, row) => {
        db.close();
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    });
  }

  static updateCategory(req, res) {
    const db = new sqlite3.Database(dbPath);
    const { id } = req.params;
    const { name, color } = req.body;
    
    if (!name || !color) {
      db.close();
      res.status(400).json({ error: 'Name and color are required' });
      return;
    }
    
    db.run('UPDATE categories SET name = ?, color = ? WHERE id = ?', [name, color, id], function(err) {
      if (err) {
        db.close();
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(409).json({ error: 'Category name already exists' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }
      
      if (this.changes === 0) {
        db.close();
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      
      // Get the updated category
      db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
        db.close();
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    });
  }

  static deleteCategory(req, res) {
    const db = new sqlite3.Database(dbPath);
    const { id } = req.params;
    
    // First check if category is being used by any todos
    db.get('SELECT COUNT(*) as count FROM todos WHERE category_id = ?', [id], (err, row) => {
      if (err) {
        db.close();
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (row.count > 0) {
        db.close();
        res.status(400).json({ error: 'Cannot delete category that is being used by todos' });
        return;
      }
      
      // Delete the category
      db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
        db.close();
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        if (this.changes === 0) {
          res.status(404).json({ error: 'Category not found' });
          return;
        }
        
        res.json({ message: 'Category deleted successfully' });
      });
    });
  }

  // Get todos by category ID
  static getTodosByCategory(req, res) {
    const db = new sqlite3.Database(dbPath);
    const { id } = req.params;
    
    db.all(`
      SELECT t.*, c.name as category_name, c.color as category_color 
      FROM todos t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.category_id = ?
      ORDER BY t.created_at DESC
    `, [id], (err, rows) => {
      db.close();
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  }
}

module.exports = CategoryController; 