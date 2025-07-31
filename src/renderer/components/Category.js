import React, { useState, useEffect } from 'react';
import { Add, Edit, Delete, ColorLens } from '../utils/mui-imports';
import './Category.css';

function Category() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#e3f2fd');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const colorOptions = [
    '#e3f2fd', 
    '#f3e5f5', 
    '#e8f5e8', 
    '#fff3e0', 
    '#fce4ec', 
    '#f1f8e9', 
    '#e0f2f1', 
    '#fff8e1', 
    '#fafafa', 
    '#e8eaf6', 
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

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
        setNewCategoryColor('#e3f2fd');
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
        <h2>Manage Categories</h2>
      </div>

      {/* Create new category */}
      <div className="create-category-section">
        <h3>Create New Category</h3>
        <div className="create-category-form">
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
              {colorOptions.map((color, index) => (
                <option key={index} value={color}>
                  {color}
                </option>
              ))}
            </select>
            <div 
              className="color-preview" 
              style={{ backgroundColor: newCategoryColor }}
            />
          </div>
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

      {/* Categories list */}
      <div className="categories-list-section">
        <h3>Existing Categories</h3>
        {categories.length === 0 ? (
          <p className="no-categories">No categories created yet. Create your first category above!</p>
        ) : (
          <div className="categories-list">
            {categories.map((category) => (
              <div key={category.id} className="category-item">
                {editingCategory?.id === category.id ? (
                  <div className="category-edit-form">
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
                        {colorOptions.map((color, index) => (
                          <option key={index} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                      <div 
                        className="color-preview" 
                        style={{ backgroundColor: editColor }}
                      />
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
                ) : (
                  <>
                    <div className="category-info">
                      <div 
                        className="category-color-indicator"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="category-name">{category.name}</span>
                    </div>
                    <div className="category-actions">
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
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Category; 