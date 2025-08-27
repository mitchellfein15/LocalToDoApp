import React, { useState, useEffect } from 'react';
import { Add, Edit, Delete, ColorLens, Folder, AddTask } from '../utils/mui-imports';
import './Category.css';

function Category({ onTodoChange }) {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('blue');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categoryTodos, setCategoryTodos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modern color palette with proper contrast for both themes
  const colorOptions = [
    { value: 'blue', label: 'Blue', light: '#3b82f6', dark: '#60a5fa' },
    { value: 'green', label: 'Green', light: '#10b981', dark: '#34d399' },
    { value: 'purple', label: 'Purple', light: '#8b5cf6', dark: '#a78bfa' },
    { value: 'orange', label: 'Orange', light: '#f59e0b', dark: '#fbbf24' },
    { value: 'red', label: 'Red', light: '#ef4444', dark: '#f87171' },
    { value: 'teal', label: 'Teal', light: '#14b8a6', dark: '#5eead4' },
    { value: 'pink', label: 'Pink', light: '#ec4899', dark: '#f472b6' },
    { value: 'indigo', label: 'Indigo', light: '#6366f1', dark: '#818cf8' },
    { value: 'yellow', label: 'Yellow', light: '#eab308', dark: '#facc15' },
    { value: 'gray', label: 'Gray', light: '#6b7280', dark: '#9ca3af' }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchCategoryTodos();
    }
  }, [categories]);

  useEffect(() => {
    if (onTodoChange) {
      fetchCategoryTodos();
    }
  }, [onTodoChange]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setError('Failed to fetch categories');
        console.error('Failed to fetch categories:', response.status);
      }
    } catch (error) {
      setError('Error fetching categories');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryTodos = async () => {
    try {
      const todosResponse = await fetch('http://localhost:3001/api/todos');
      if (todosResponse.ok) {
        const todos = await todosResponse.json();
        
        // Group todos by category and format them properly
        const groupedTodos = {};
        categories.forEach(category => {
          const categoryTodos = todos.filter(todo => todo.category_id === category.id);
          groupedTodos[category.id] = categoryTodos.map(todo => ({
            ...todo,
            category: {
              id: category.id,
              name: category.name,
              color: category.color
            }
          }));
        });
        
        setCategoryTodos(groupedTodos);
      }
    } catch (error) {
      console.error('Error fetching category todos:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch('http://localhost:3001/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          color: newCategoryColor,
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
        setNewCategoryColor('blue');
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    }
  };

  const handleEditCategory = async () => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`http://localhost:3001/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          color: editColor,
        }),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ));
        setEditingCategory(null);
        setEditName('');
        setEditColor('');
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== categoryId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const startEditing = (category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName('');
    setEditColor('');
  };

  return (
    <div className="category-container">
      <div className="category-header">
        <div className="header-content">
          <h1>Categories</h1>
          <p>Organize your todos with custom categories</p>
        </div>
        <button 
          className="create-category-toggle"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <Add />
          {showCreateForm ? 'Cancel' : 'New Category'}
        </button>
      </div>

      {/* Create new category */}
      {showCreateForm && (
        <div className="create-category-section">
          <div className="create-category-form">
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="categoryName">Category Name</label>
                <input
                  id="categoryName"
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="category-name-input"
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="categoryColor">Color</label>
                <div className="color-picker">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`color-option ${newCategoryColor === color.value ? 'selected' : ''}`}
                      style={{ 
                        backgroundColor: color.light,
                        '--dark-color': color.dark
                      }}
                      onClick={() => setNewCategoryColor(color.value)}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className="create-category-btn"
              >
                <Add />
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories grid */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchCategories} className="retry-btn">
            Try Again
          </button>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.length === 0 ? (
            <div className="empty-state">
              <Folder className="empty-icon" />
              <h3>No categories yet</h3>
              <p>Create your first category to start organizing your todos</p>
              <button 
                className="create-first-btn"
                onClick={() => setShowCreateForm(true)}
              >
                <Add />
                Create Category
              </button>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="category-card">
              {editingCategory?.id === category.id ? (
                <div className="category-edit-form">
                  <div className="edit-header">
                    <h3>Edit Category</h3>
                  </div>
                  
                  <div className="edit-content">
                    <div className="input-group">
                      <label htmlFor={`editName-${category.id}`}>Name</label>
                      <input
                        id={`editName-${category.id}`}
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="edit-category-name"
                      />
                    </div>
                    
                    <div className="input-group">
                      <label>Color</label>
                      <div className="color-picker">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            className={`color-option ${editColor === color.value ? 'selected' : ''}`}
                            style={{ 
                              backgroundColor: color.light,
                              '--dark-color': color.dark
                            }}
                            onClick={() => setEditColor(color.value)}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="edit-actions">
                    <button onClick={handleEditCategory} className="save-btn">
                      Save Changes
                    </button>
                    <button onClick={cancelEditing} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="category-header">
                    <div 
                      className="category-color-badge"
                      style={{ 
                        backgroundColor: colorOptions.find(c => c.value === category.color)?.light,
                        '--dark-color': colorOptions.find(c => c.value === category.color)?.dark
                      }}
                    />
                    <div className="category-title">
                      <h3>{category.name}</h3>
                    </div>
                    <div className="category-actions">
                      <button 
                        onClick={() => startEditing(category)}
                        className="action-btn edit-btn"
                        title="Edit category"
                      >
                        <Edit />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="action-btn delete-btn"
                        title="Delete category"
                      >
                        <Delete />
                      </button>
                    </div>
                  </div>
                  
                  <div className="category-content">
                    <div className="category-stats">
                      <span className="stat-item">
                        <AddTask />
                        <span>{categoryTodos[category.id]?.length || 0} todos</span>
                      </span>
                    </div>
                    
                    <div className="category-todos">
                      {categoryTodos[category.id] && categoryTodos[category.id].length > 0 ? (
                        <div className="todos-list">
                          {categoryTodos[category.id].slice(0, 3).map((todo) => (
                            <div key={todo.id} className="category-todo-item">
                              <div className="todo-checkbox">
                                <input
                                  type="checkbox"
                                  checked={todo.completed}
                                  readOnly
                                />
                              </div>
                              <div className="todo-info">
                                <span className={`todo-title ${todo.completed ? 'completed' : ''}`}>
                                  {todo.title}
                                </span>
                                {todo.due_date && (
                                  <span className="todo-due-date">
                                    Due: {new Date(todo.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {categoryTodos[category.id].length > 3 && (
                            <div className="more-todos">
                              +{categoryTodos[category.id].length - 3} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="no-todos">No todos in this category yet</p>
                      )}
                    </div>
                  </div>
                </>
              )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Category; 