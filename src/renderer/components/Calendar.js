import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import ApiService from '../services/api';
import './Calendar.css';

const INITIAL_MONTHS_BEFORE = 2;
const INITIAL_MONTHS_AFTER = 4;
const MONTH_BATCH_SIZE = 3;
const SCROLL_THRESHOLD_PX = 240;

function Calendar({ onDelete, onUpdate, onShowDetails, compact = false, showTitle = true }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthStart, setMonthStart] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - INITIAL_MONTHS_BEFORE, 1);
  });
  const [monthEnd, setMonthEnd] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + INITIAL_MONTHS_AFTER, 1);
  });
  const [pendingPrepend, setPendingPrepend] = useState(false);
  const scrollContainerRef = useRef(null);
  const monthRefs = useRef(new Map());
  const prependSnapshotRef = useRef({ scrollTop: 0, scrollHeight: 0 });
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        goToToday('auto'); 
      }, 0);
    }
  }, [loading]);

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
      setTodos(todos.map(todo => 
        todo.id === id ? updatedTodo : todo
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

  const getDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  const addMonths = (date, months) => {
    return new Date(date.getFullYear(), date.getMonth() + months, 1);
  };

  const getMonthKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
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

  const todosByDate = useMemo(() => {
    return todos.reduce((index, todo) => {
      if (!todo.due_date) {
        return index;
      }
      if (!index[todo.due_date]) {
        index[todo.due_date] = [];
      }
      index[todo.due_date].push(todo);
      return index;
    }, {});
  }, [todos]);

  const monthsToRender = useMemo(() => {
    const months = [];
    const cursor = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
    while (cursor <= monthEnd) {
      months.push(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  }, [monthStart, monthEnd]);

  useLayoutEffect(() => {
    if (!pendingPrepend || !scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const { scrollTop, scrollHeight } = prependSnapshotRef.current;
    const heightDiff = container.scrollHeight - scrollHeight;
    container.scrollTop = scrollTop + Math.max(heightDiff, 0);

    setPendingPrepend(false);
    isLoadingMoreRef.current = false;
  }, [monthsToRender, pendingPrepend]);

  const extendMonthWindow = (direction) => {
    if (isLoadingMoreRef.current) {
      return;
    }

    if (!scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    isLoadingMoreRef.current = true;

    if (direction === 'past') {
      prependSnapshotRef.current = {
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight
      };
      setMonthStart((prev) => addMonths(prev, -MONTH_BATCH_SIZE));
      setPendingPrepend(true);
      return;
    }

    setMonthEnd((prev) => addMonths(prev, MONTH_BATCH_SIZE));
    isLoadingMoreRef.current = false;
  };

  const handleMonthScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || isLoadingMoreRef.current) {
      return;
    }

    const nearTop = container.scrollTop < SCROLL_THRESHOLD_PX;
    const distanceToBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
    const nearBottom = distanceToBottom < SCROLL_THRESHOLD_PX;

    if (nearTop) {
      extendMonthWindow('past');
      return;
    }

    if (nearBottom) {
      extendMonthWindow('future');
    }
  };

  const goToToday = (behavior = 'smooth') => {
    const today = new Date();
    const todayKey = getMonthKey(today);
    const todayMonthElement = monthRefs.current.get(todayKey);
    const container = scrollContainerRef.current;

    if (container && todayMonthElement) {
      const topOffset = todayMonthElement.offsetTop-150;
      container.scrollTo({ top: Math.max(topOffset, 0), behavior });
      return;
    }

    setMonthStart(new Date(today.getFullYear(), today.getMonth() - INITIAL_MONTHS_BEFORE, 1));
    setMonthEnd(new Date(today.getFullYear(), today.getMonth() + INITIAL_MONTHS_AFTER, 1));
  };

  const renderMonthDays = (monthDate) => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(monthDate);
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`${getMonthKey(monthDate)}-empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const dateKey = getDateString(date);
      const todosForDay = todosByDate[dateKey] || [];

      days.push(
        <div
          key={`${getMonthKey(monthDate)}-day-${day}`}
          className={`calendar-day ${isToday(date) ? 'today' : ''}`}
        >
          <div className="day-header">
            <span className="day-number">{day}</span>
            {todosForDay.length > 0 && (
              <span className="todo-count">{todosForDay.length}</span>
            )}
          </div>
          <div className="day-todos">
            {todosForDay.map((todo) => (
              <div
                key={todo.id}
                className="calendar-todo-simple"
                onClick={() => onShowDetails && onShowDetails(todo)}
              >
                <div className="todo-simple-content">
                  <span className="todo-simple-title">
                    {todo.title}
                  </span>
                  {isOverdue(todo.due_date) && (
                    <span className="todo-overdue-indicator">Overdue</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return <div className="loading">Loading calendar...</div>;
  }

  return (
    <div className={`calendar ${compact ? 'calendar-compact' : ''}`}>
      {showTitle && (
        <div className="calendar-header">
          <h2 className="calendar-title">Calendar</h2>
          <button onClick={() => goToToday('smooth')} className="today-btn">
            Today
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div
        className="calendar-grid continuous-calendar"
        ref={scrollContainerRef}
        onScroll={handleMonthScroll}
      >
        <div className="calendar-weekdays sticky-weekdays">
          <div className="weekday">Sun</div>
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
        </div>

        <div className="calendar-months">
          {monthsToRender.map((monthDate) => {
            const monthKey = getMonthKey(monthDate);
            return (
              <section
                key={monthKey}
                className="calendar-month-section"
                ref={(element) => {
                  if (element) {
                    monthRefs.current.set(monthKey, element);
                  } else {
                    monthRefs.current.delete(monthKey);
                  }
                }}
              >
                <div className="month-section-header">
                  {formatMonthYear(monthDate)}
                </div>
                <div className="calendar-days">
                  {renderMonthDays(monthDate)}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Calendar;