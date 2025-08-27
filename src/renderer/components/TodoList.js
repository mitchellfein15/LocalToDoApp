import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import ApiService from '../services/api';
import './TodoList.css';

function TodoList({ onShowDetails, onToggle, onDelete, onUpdate }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTodos();
      
      // Format todos to include proper category object
      const formattedTodos = data.map(todo => ({
        ...todo,
        category: todo.category_name ? {
          id: todo.category_id,
          name: todo.category_name,
          color: todo.category_color
        } : null
      }));
      
      setTodos(formattedTodos);
      setError(null);
    } catch (err) {
      setError('Failed to load todos');
      console.error('Error loading todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (todoData) => {
    try {
      const newTodo = await ApiService.createTodo(todoData);
      
      // Format the new todo to include proper category object
      const formattedTodo = {
        ...newTodo,
        category: newTodo.category_name ? {
          id: newTodo.category_id,
          name: newTodo.category_name,
          color: newTodo.category_color
        } : null
      };
      
      setTodos([formattedTodo, ...todos]);
      setShowForm(false);
    } catch (err) {
      setError('Failed to create todo');
      console.error('Error creating todo:', err);
    }
  };

  const handleToggleTodo = async (id) => {
    try {
      const updatedTodo = await ApiService.toggleTodo(id);
      
      // Format the updated todo to include proper category object
      const formattedTodo = {
        ...updatedTodo,
        category: updatedTodo.category_name ? {
          id: updatedTodo.category_id,
          name: updatedTodo.category_name,
          color: updatedTodo.category_color
        } : null
      };
      
      setTodos(todos.map(todo => 
        todo.id === id ? formattedTodo : todo
      ));
      // Call the parent handler if provided
      if (onToggle) {
        onToggle(id);
      }
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await ApiService.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
      // Call the parent handler if provided
      if (onDelete) {
        onDelete(id);
      }
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  const handleUpdateTodo = async (id, todoData) => {
    try {
      const updatedTodo = await ApiService.updateTodo(id, todoData);
      
      // Format the updated todo to include proper category object
      const formattedTodo = {
        ...updatedTodo,
        category: updatedTodo.category_name ? {
          id: updatedTodo.category_id,
          name: updatedTodo.category_name,
          color: updatedTodo.category_color
        } : null
      };
      
      setTodos(todos.map(todo => 
        todo.id === id ? formattedTodo : todo
      ));
      // Call the parent handler if provided
      if (onUpdate) {
        onUpdate(id, todoData);
      }
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading todos...</div>;
  }

  return (
    <div className="todo-list">
      <div className="todo-header">
        <div className="header-actions">
          <button 
            className="add-todo-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add Todo'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showForm && (
        <TodoForm 
          onSubmit={handleCreateTodo}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="todos-container">
        {todos.length === 0 ? (
          <div className="empty-state">
            <p>No todos</p>
          </div>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
              onUpdate={handleUpdateTodo}
              onShowDetails={onShowDetails}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TodoList; 