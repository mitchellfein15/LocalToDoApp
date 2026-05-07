import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import TodoList from './components/TodoList';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import TodoDetailModal from './components/TodoDetailModal';
import HeatmapCard from './components/HeatmapCard';
import NotesCard from './components/NotesCard';
import TimerWidget from './components/TimerWidget';
import WeatherCard from './components/WeatherCard';
import StatsSummaryCard from './components/StatsSummaryCard';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [showTodoModal, setShowTodoModal] = useState(false);

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleShowTodoDetails = (todo) => {
    setSelectedTodo(todo);
    setShowTodoModal(true);
  };

  const handleCloseTodoModal = () => {
    setShowTodoModal(false);
    setSelectedTodo(null);
  };

  const handleDeleteTodo = (todoId) => {
    handleCloseTodoModal();
  };

  const handleUpdateTodo = () => {
    handleCloseTodoModal();
  };

  const renderMainContent = () => {
    if (activeView === 'todo') {
      return (
        <div className="single-view-card dashboard-card">
          <TodoList
            onShowDetails={handleShowTodoDetails}
            onDelete={handleDeleteTodo}
            onUpdate={handleUpdateTodo}
          />
        </div>
      );
    }

    if (activeView === 'calendar') {
      return (
        <div className="single-view-card dashboard-card">
          <Calendar
            onShowDetails={handleShowTodoDetails}
            onDelete={handleDeleteTodo}
            onUpdate={handleUpdateTodo}
            showTitle
          />
        </div>
      );
    }

    if (activeView === 'notes') {
      return (
        <div className="single-view-card dashboard-card">
          <NotesCard expanded />
        </div>
      );
    }

    return (
      <div className="dashboard-grid">
        <div className="dashboard-card card-todos">
          <h3 className="card-title">Todo</h3>
          <TodoList
            compact
            onShowDetails={handleShowTodoDetails}
            onDelete={handleDeleteTodo}
            onUpdate={handleUpdateTodo}
          />
        </div>

        <div className="dashboard-card card-calendar">
          <h3 className="card-title">Calendar</h3>
          <Calendar
            compact
            showTitle={false}
            onShowDetails={handleShowTodoDetails}
            onDelete={handleDeleteTodo}
            onUpdate={handleUpdateTodo}
          />
        </div>

        <div className="dashboard-card card-heatmap">
          <h3 className="card-title">Productivity Heatmap</h3>
          <HeatmapCard />
        </div>

        <div className="dashboard-card card-notes">
          <h3 className="card-title">Notes</h3>
          <NotesCard />
        </div>

        <div className="dashboard-card card-weather">
          <h3 className="card-title">Weather</h3>
          <WeatherCard />
        </div>

        <div className="dashboard-card card-stats">
          <h3 className="card-title">Quick Stats</h3>
          <StatsSummaryCard />
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider>
      <div className="App">
        <Navbar 
          activeView={activeView}
          onViewChange={setActiveView}
          onSettingsClick={handleSettingsClick}
        />
        
        <div className="app-shell">
          <main className="app-content">
            {renderMainContent()}
          </main>
        </div>

        <TimerWidget />
        
        <Settings 
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
        
        <TodoDetailModal
          open={showTodoModal}
          onClose={handleCloseTodoModal}
          todo={selectedTodo}
          onDelete={handleDeleteTodo}
          onUpdate={handleUpdateTodo}
        />
      </div>
    </ThemeProvider>
  );
}

export default App; 