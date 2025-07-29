import React from 'react';
import { Settings as SettingsIcon } from '@mui/icons-material';
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
      </div>
      
      <div className="nav-actions">
        <button 
          className="settings-btn"
          onClick={onSettingsClick}
          title="Settings"
        >
          <SettingsIcon />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;