import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import './Calendar.css';

function Calendar({ onToggle, onDelete, onUpdate }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const getTodosForDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return todos.filter(todo => 
      todo.due_date && todo.due_date === dateString
    );
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    
    // If it's a date-only string (YYYY-MM-DD), parse it as local date
    if (dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dueDate.split('-');
      const dueDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const dueStart = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate());
      
      return dueStart < todayStart;
    }
    
    // For other date formats, use the original method
    const today = new Date();
    const due = new Date(dueDate);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    return dueStart < todayStart;
  };

  if (loading) {
    return <div className="loading">Loading calendar...</div>;
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const todosForDay = getTodosForDate(date);
    const dayTodos = todosForDay.filter(todo => !todo.completed);
    const completedTodos = todosForDay.filter(todo => todo.completed);
    
    days.push(
      <div 
        key={day} 
        className={`calendar-day ${isToday(date) ? 'today' : ''}`}
      >
        <div className="day-header">
          <span className="day-number">{day}</span>
          {dayTodos.length > 0 && (
            <span className="todo-count">{dayTodos.length}</span>
          )}
        </div>
        <div className="day-todos">
          {todosForDay.map(todo => (
            <div key={todo.id} className="calendar-todo-simple">
              <div className="todo-simple-content">
                <span className={`todo-simple-title ${todo.completed ? 'completed' : ''}`}>
                  {todo.title}
                </span>
                {isOverdue(todo.due_date) && !todo.completed && (
                  <span className="todo-overdue-indicator">Overdue</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div className="calendar-controls">
          <button onClick={goToPreviousMonth} className="nav-btn">
            ‹
          </button>
          <h2 className="current-month">{formatMonthYear(currentDate)}</h2>
          <button onClick={goToNextMonth} className="nav-btn">
            ›
          </button>
        </div>
        <button onClick={goToToday} className="today-btn">
          Today
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          <div className="weekday">Sun</div>
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
        </div>
        <div className="calendar-days">
          {days}
        </div>
      </div>
    </div>
  );
}

export default Calendar;