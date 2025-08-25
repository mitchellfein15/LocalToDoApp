import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import ApiService from '../services/api';
import './TodoList.css';

function TodoList({ onShowDetails, onToggle, onDelete, onUpdate }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTodos();
      setTodos(data);
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
      setTodos([newTodo, ...todos]);
      setShowForm(false);
    } catch (err) {
      console.error('Error creating todo:', err);
    }
  };

  const handleToggleTodo = async (id) => {
    try {
      const updatedTodo = await ApiService.toggleTodo(id);
      setTodos(todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      // Call the parent handler if provided
      if (onToggle) {
        onToggle(id);
      }
    } catch (err) {
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
      console.error('Error deleting todo:', err);
    }
  };

  const handleUpdateTodo = async (id, todoData) => {
    try {
      const updatedTodo = await ApiService.updateTodo(id, todoData);
      setTodos(todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      // Call the parent handler if provided
      if (onUpdate) {
        onUpdate(id, todoData);
      }
    } catch (err) {
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