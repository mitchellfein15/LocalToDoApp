import React from 'react';
import { SettingsIcon } from '../utils/mui-imports';
import { useTheme } from '../context/ThemeContext';
import cwruImage from '../../../public/CWRU_image.png';
import cwruWhite from '../../../public/CWRU_white.png';
import './Navbar.css';

function Navbar({ activeTab, onTabChange, onSettingsClick }) {
  const { isDarkMode } = useTheme();
  
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img 
          src={isDarkMode ? cwruWhite : cwruImage} 
          alt="CWRU" 
          className="nav-logo"
        />
        <h1>CWRU</h1>
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