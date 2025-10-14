import React, { useState } from 'react';
import { Edit, Delete, Check } from '../utils/mui-imports';
import './TodoItem.css';

function TodoItem({ todo, onToggle, onDelete, onUpdate, onShowDetails }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editDueDate, setEditDueDate] = useState(todo.due_date || '');
  const [isCompleting, setIsCompleting] = useState(false);

  const handleToggle = () => {
    onToggle(todo.id);
  };

  const handleComplete = () => {
    setIsCompleting(true);
    
    // Trigger the completion animation
    setTimeout(() => {
      onDelete(todo.id);
    }, 1000); // Allow animation to complete before deleting
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        due_date: editDueDate || null
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditDueDate(todo.due_date || '');
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
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${isCompleting ? 'completing' : ''}`}>
      <div className="todo-content" onClick={() => onShowDetails && onShowDetails(todo)}>
        <div className="todo-checkbox" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggle}
          />
        </div>
        
        <div className="todo-details">
          <h3 className="todo-title">{todo.title}</h3>
          {todo.description && (
            <p className="todo-description">{todo.description}</p>
          )}
          <div className="todo-meta">
            {todo.due_date && (
              <span className={`todo-due-date ${isOverdue(todo.due_date) ? 'overdue' : ''}`}>
                Due: {formatDate(todo.due_date)}
                {isOverdue(todo.due_date) && <span className="overdue-indicator"> (Overdue)</span>}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="todo-actions">
        <button onClick={(e) => { e.stopPropagation(); handleEdit(); }} className="edit-btn" title="Edit">
          <Edit color="inherit" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleComplete(); }} className="complete-btn" title="Complete Task">
          <Check color="inherit" />
        </button>
      </div>
    </div>
  );
}

export default TodoItem; 