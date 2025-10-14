import React, { useState, useEffect, useRef } from 'react';
import './TodoForm.css';

function TodoForm({ onSubmit, onCancel }) {
  const titleRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    // Set default due date to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    resetForm();
    
    // Focus the title input when form opens
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.focus();
      }
    }, 100);
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    // Set default due date to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setDueDate(`${year}-${month}-${day}`);
    setErrors({});
    setIsSubmitting(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate || null
      };

      await onSubmit(formData);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="todo-form-overlay" onClick={handleCancel}>
      <div className="todo-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="todo-form-header">
          <h2>Create New Todo</h2>
          <button
            type="button"
            className="close-btn"
            onClick={handleCancel}
            aria-label="Close form"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="todo-form-content">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              ref={titleRef}
              type="text"
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck="false"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Add more details (optional)"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={(() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              })()}
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>



          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Todo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TodoForm;
