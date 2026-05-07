import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import ApiService from '../services/api';
import './TodoList.css';

function TodoList({ onShowDetails, onDelete, onUpdate, compact = false }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Sort todos by due date (closest first), with null/empty due dates at the end
  const sortTodosByDueDate = (todosList) => {
    return [...todosList].sort((a, b) => {
      // If both have due dates, sort by date (ascending - closest first)
      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      // If only a has a due date, it comes first
      if (a.due_date && !b.due_date) {
        return -1;
      }
      // If only b has a due date, it comes first
      if (!a.due_date && b.due_date) {
        return 1;
      }
      // If neither has a due date, maintain original order
      return 0;
    });
  };

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTodos();
      setTodos(sortTodosByDueDate(data));
    } catch (err) {
      console.error('Error loading todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (todoData) => {
    try {
      const newTodo = await ApiService.createTodo(todoData);
      setTodos(sortTodosByDueDate([...todos, newTodo]));
      setShowForm(false);
    } catch (err) {
      console.error('Error creating todo:', err);
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

  const handleCompleteTodo = async (id) => {
    try {
      await ApiService.completeTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
      if (onUpdate) {
        onUpdate(id, { completed: true });
      }
    } catch (err) {
      console.error('Error completing todo:', err);
    }
  };

  const handleUpdateTodo = async (id, todoData) => {
    try {
      const updatedTodo = await ApiService.updateTodo(id, todoData);
      const updatedTodos = todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      );
      setTodos(sortTodosByDueDate(updatedTodos));
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
    <div className={`todo-list ${compact ? 'todo-list-compact' : ''}`}>
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
              onDelete={handleDeleteTodo}
              onUpdate={handleUpdateTodo}
              onComplete={handleCompleteTodo}
              onShowDetails={onShowDetails}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TodoList; 