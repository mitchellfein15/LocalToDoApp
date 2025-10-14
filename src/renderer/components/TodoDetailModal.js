import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Divider, Chip } from '../utils/mui-imports';
import './TodoDetailModal.css';

function TodoDetailModal({ open, onClose, todo, onDelete, onUpdate }) {
  if (!todo) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
    }
    
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
    }
    
    return new Date(dateString).toLocaleString();
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    
    if (dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dueDate.split('-');
      const dueDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const dueStart = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate());
      
      return dueStart < todayStart;
    }
    
    const today = new Date();
    const due = new Date(dueDate);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    return dueStart < todayStart;
  };

  const getStatusText = () => {
    if (isOverdue(todo.due_date)) return 'Overdue';
    if (todo.due_date) return 'Pending';
    return 'No due date';
  };

  const getStatusColor = () => {
    if (isOverdue(todo.due_date)) return '#f44336';
    if (todo.due_date) return '#ff9800';
    return '#9e9e9e';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className="todo-detail-modal"
    >
      <DialogTitle className="modal-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" component="h2" className="todo-title-main">
            {todo.title}
          </Typography>
          <Chip 
            label={getStatusText()}
            className="status-chip"
            style={{ backgroundColor: getStatusColor() }}
            size="small"
          />
        </Box>
      </DialogTitle>
      
      <DialogContent className="modal-content">
        {todo.description && (
          <Box className="todo-detail-section main-content">
            <Typography variant="body1" className="todo-description">
              {todo.description}
            </Typography>
          </Box>
        )}

        <Box className="todo-detail-section main-content">
          <Typography variant="h6" className="section-title">
            Due Date
          </Typography>
          <Typography 
            variant="body1" 
            className={`todo-due-date ${isOverdue(todo.due_date) ? 'overdue' : ''}`}
          >
            {todo.due_date ? formatDate(todo.due_date) : 'No due date set'}
            {isOverdue(todo.due_date) && (
              <span className="overdue-indicator"> (Overdue)</span>
            )}
          </Typography>
        </Box>

        <Box className="metadata-section">
          <Box className="metadata-item">
            <Typography variant="caption" className="metadata-label">
              Created
            </Typography>
            <Typography variant="body2" className="metadata-value">
              {formatDateTime(todo.created_at)}
            </Typography>
          </Box>

          {todo.updated_at !== todo.created_at && (
            <Box className="metadata-item">
              <Typography variant="caption" className="metadata-label">
                Last Updated
              </Typography>
              <Typography variant="body2" className="metadata-value">
                {formatDateTime(todo.updated_at)}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default TodoDetailModal; 