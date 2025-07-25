import React, { useState } from 'react';
import './TodoForm.css';

function TodoForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim()
      });
      setTitle('');
      setDescription('');
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    onCancel();
  };

  return (
    <div className="todo-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details (optional)"
            rows="3"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Add Todo
          </button>
          <button type="button" onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default TodoForm; 