import React from 'react';
import { SettingsIcon } from '../utils/mui-imports';
import './Navbar.css';

function Navbar({ activeTab, onTabChange, onSettingsClick }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h1>Local Todo App</h1>
      </div>
      
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'todo' ? 'active' : ''}`}
          onClick={() => onTabChange('todo')}
        >
          Todo
        </button>
        <button 
          className={`nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => onTabChange('calendar')}
        >
          Calendar
        </button>
        <button 
          className={`nav-tab ${activeTab === 'category' ? 'active' : ''}`}
          onClick={() => onTabChange('category')}
        >
          Categories
        </button>
      </div>
      
      <div className="nav-actions">
        <button 
          className="settings-btn"
          onClick={onSettingsClick}
          title="Settings"
        >
          <SettingsIcon color="inherit" />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;