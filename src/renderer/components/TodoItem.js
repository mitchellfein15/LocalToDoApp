import React, { useState, useEffect } from 'react';
import { Edit, Delete } from '../utils/mui-imports';
import './TodoItem.css';

function TodoItem({ todo, onToggle, onDelete, onUpdate, onShowDetails }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editDueDate, setEditDueDate] = useState(todo.due_date || '');
  const [editCategoryId, setEditCategoryId] = useState(todo.category_id || '');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleToggle = () => {
    onToggle(todo.id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      onDelete(todo.id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        due_date: editDueDate || null,
        category_id: editCategoryId || null
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditDueDate(todo.due_date || '');
    setEditCategoryId(todo.category_id || '');
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
    }
    
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    
    if (dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dueDate.split('-');
      const dueDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const dueStart = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate());
      
      return dueStart < todayStart && !todo.completed;
    }
    
    const today = new Date();
    const due = new Date(dueDate);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    return dueStart < todayStart && !todo.completed;
  };

  if (isEditing) {
    return (
      <div className="todo-item editing">
        <div className="todo-edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Todo title"
            className="edit-title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            className="edit-description"
          />
          <select
            value={editCategoryId}
            onChange={(e) => setEditCategoryId(e.target.value)}
            className="edit-category-select"
          >
            <option value="">No Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="edit-due-date"
            min={(() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            })()}
          />
          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content" onClick={() => onShowDetails && onShowDetails(todo)}>
        <div className="todo-checkbox" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggle}
          />
        </div>
        
        <div className="todo-details">
          <div className="todo-header">
            <h3 className="todo-title">{todo.title}</h3>
            {todo.category_name && (
              <span 
                className="todo-category"
                style={{ 
                  backgroundColor: todo.category_color,
                  color: getContrastColor(todo.category_color)
                }}
              >
                {todo.category_name}
              </span>
            )}
          </div>
          {todo.description && (
            <p className="todo-description">{todo.description}</p>
          )}
          <div className="todo-meta">
            <span className="todo-date">
              Created: {formatDate(todo.created_at)}
            </span>
            {todo.due_date && (
              <span className={`todo-due-date ${isOverdue(todo.due_date) ? 'overdue' : ''}`}>
                Due: {formatDate(todo.due_date)}
                {isOverdue(todo.due_date) && <span className="overdue-indicator"> (Overdue)</span>}
              </span>
            )}
            {todo.updated_at !== todo.created_at && (
              <span className="todo-updated">
                Updated: {formatDate(todo.updated_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="todo-actions">
        <button onClick={(e) => { e.stopPropagation(); handleEdit(); }} className="edit-btn" title="Edit">
          <Edit color="inherit" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="delete-btn" title="Delete">
          <Delete color="inherit" />
        </button>
      </div>
    </div>
  );
}

// Helper function to determine text color based on background color
function getContrastColor(hexColor) {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default TodoItem; 