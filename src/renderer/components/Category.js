import React, { useState, useEffect } from 'react';
import { Add, Edit, Delete, ColorLens, AddTask, Visibility, VisibilityOff } from '../utils/mui-imports';
import './Category.css';

function Category() {
  const [categories, setCategories] = useState([]);
  const [todosByCategory, setTodosByCategory] = useState({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Modern color palette that works well with both light and dark modes
  const colorOptions = [
    { value: '#3b82f6', name: 'Blue' },
    { value: '#10b981', name: 'Green' },
    { value: '#f59e0b', name: 'Amber' },
    { value: '#ef4444', name: 'Red' },
    { value: '#8b5cf6', name: 'Purple' },
    { value: '#06b6d4', name: 'Cyan' },
    { value: '#f97316', name: 'Orange' },
    { value: '#ec4899', name: 'Pink' },
    { value: '#84cc16', name: 'Lime' },
    { value: '#6b7280', name: 'Gray' }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchTodosForAllCategories();
    }
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories:', response.status);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTodosForAllCategories = async () => {
    const todosData = {};
    
    for (const category of categories) {
      try {
        const response = await fetch(`http://localhost:3001/api/categories/${category.id}/todos`);
        if (response.ok) {
          const todos = await response.json();
          todosData[category.id] = todos;
        }
      } catch (error) {
        console.error(`Error fetching todos for category ${category.id}:`, error);
        todosData[category.id] = [];
      }
    }
    
    setTodosByCategory(todosData);
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
        setNewCategoryColor('#3b82f6');
        setShowCreateForm(false);
        // Expand the new category
        setExpandedCategories(prev => new Set([...prev, newCategory.id]));
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
    if (!window.confirm('Are you sure you want to delete this category? This will remove the category from all associated todos.')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== categoryId));
        setTodosByCategory(prev => {
          const newTodos = { ...prev };
          delete newTodos[categoryId];
          return newTodos;
        });
        setExpandedCategories(prev => {
          const newExpanded = new Set(prev);
          newExpanded.delete(categoryId);
          return newExpanded;
        });
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

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  };

  const getContrastColor = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="category-container">
      <div className="category-header">
        <h2>Categories</h2>
        <p>Organize your todos with custom categories</p>
      </div>

      {/* Create new category button */}
      <div className="create-category-section">
        {!showCreateForm ? (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="create-category-btn"
          >
            <Add />
            Create New Category
          </button>
        ) : (
          <div className="create-category-form">
            <h3>Create New Category</h3>
            <div className="form-row">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="category-name-input"
              />
              <div className="color-picker-container">
                <ColorLens className="color-icon" />
                <select
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="color-select"
                >
                  {colorOptions.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
                <div 
                  className="color-preview" 
                  style={{ backgroundColor: newCategoryColor }}
                />
              </div>
            </div>
            <div className="form-actions">
              <button 
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className="submit-btn"
              >
                <Add />
                Create Category
              </button>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Categories list with todo containers */}
      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="no-categories">
            <div className="no-categories-icon">📁</div>
            <h3>No categories yet</h3>
            <p>Create your first category to start organizing your todos!</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-card-header">
                <div className="category-info">
                  <div 
                    className="category-color-indicator"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="category-name">{category.name}</h3>
                  <span className="todo-count">
                    {todosByCategory[category.id]?.length || 0} todos
                  </span>
                </div>
                <div className="category-actions">
                  <button 
                    onClick={() => toggleCategoryExpansion(category.id)}
                    className="expand-btn"
                    title={expandedCategories.has(category.id) ? "Collapse" : "Expand"}
                  >
                    {expandedCategories.has(category.id) ? <VisibilityOff /> : <Visibility />}
                  </button>
                  <button 
                    onClick={() => startEditing(category)}
                    className="edit-btn"
                    title="Edit category"
                  >
                    <Edit />
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(category.id)}
                    className="delete-btn"
                    title="Delete category"
                  >
                    <Delete />
                  </button>
                </div>
              </div>

              {/* Edit form */}
              {editingCategory?.id === category.id && (
                <div className="category-edit-form">
                  <div className="form-row">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="edit-category-name"
                    />
                    <div className="color-picker-container">
                      <ColorLens className="color-icon" />
                      <select
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="color-select"
                      >
                        {colorOptions.map((color) => (
                          <option key={color.value} value={color.value}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                      <div 
                        className="color-preview" 
                        style={{ backgroundColor: editColor }}
                      />
                    </div>
                  </div>
                  <div className="edit-actions">
                    <button onClick={handleEditCategory} className="save-btn">
                      Save
                    </button>
                    <button onClick={cancelEditing} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Todos container */}
              {expandedCategories.has(category.id) && (
                <div className="todos-container">
                  <div className="todos-header">
                    <h4>Todos in {category.name}</h4>
                    <button className="add-todo-btn">
                      <AddTask />
                      Add Todo
                    </button>
                  </div>
                  
                  {todosByCategory[category.id]?.length === 0 ? (
                    <div className="no-todos">
                      <p>No todos in this category yet.</p>
                    </div>
                  ) : (
                    <div className="todos-list">
                      {todosByCategory[category.id]?.map((todo) => (
                        <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                          <div className="todo-content">
                            <div className="todo-checkbox">
                              <input
                                type="checkbox"
                                checked={todo.completed}
                                readOnly
                              />
                            </div>
                            <div className="todo-details">
                              <h5 className="todo-title">{todo.title}</h5>
                              {todo.description && (
                                <p className="todo-description">{todo.description}</p>
                              )}
                              {todo.due_date && (
                                <span className="todo-due-date">
                                  Due: {formatDate(todo.due_date)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Category; 