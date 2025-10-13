import React from 'react';
import { SettingsIcon } from '../utils/mui-imports';
import './Navbar.css';

function Navbar({ activeTab, onTabChange, onSettingsClick }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
          <img 
            src="/calendar_icon_176372.ico" 
            alt="Local Todo App" 
            className="nav-logo"
        />
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