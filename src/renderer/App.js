import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import TodoList from './components/TodoList';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('todo');
  const [showSettings, setShowSettings] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
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
          {activeTab === 'todo' && <TodoList />}
          {activeTab === 'calendar' && <Calendar />}
        </div>
        
        <Settings 
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </ThemeProvider>
  );
}

export default App; 