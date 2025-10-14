import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import TodoList from './components/TodoList';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import TodoDetailModal from './components/TodoDetailModal';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('todo');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [showTodoModal, setShowTodoModal] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

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

  const handleUpdateTodo = (todoId, updates) => {
    handleCloseTodoModal();
  };

  return (
    <ThemeProvider>
      <div className="App">
        <Navbar 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onSettingsClick={handleSettingsClick}
        />
        
        <div className="app-content">
          {activeTab === 'todo' && (
            <TodoList 
              onShowDetails={handleShowTodoDetails}
              onDelete={handleDeleteTodo}
              onUpdate={handleUpdateTodo}
            />
          )}
          {activeTab === 'calendar' && (
            <Calendar 
              onShowDetails={handleShowTodoDetails}
              onDelete={handleDeleteTodo}
              onUpdate={handleUpdateTodo}
            />
          )}
        </div>
        
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