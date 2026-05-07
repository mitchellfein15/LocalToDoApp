import React from 'react';
import { SettingsIcon } from '../utils/mui-imports';
import { useTheme } from '../context/ThemeContext';
import cwruImage from '../../../public/CWRU_image.png';
import cwruWhite from '../../../public/CWRU_white.png';
import './Navbar.css';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'todo', label: 'Todos' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'notes', label: 'Notes' }
];

function Navbar({ activeView, onViewChange, onSettingsClick }) {
  const { isDarkMode } = useTheme();
  
  return (
    <aside className="sidebar-nav">
      <div className="sidebar-brand">
        <img 
          src={isDarkMode ? cwruWhite : cwruImage} 
          alt="CWRU" 
          className="sidebar-logo"
        />
        <h1>LocalDash</h1>
      </div>
      
      <nav className="sidebar-links">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`sidebar-link ${activeView === item.key ? 'active' : ''}`}
            onClick={() => onViewChange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="sidebar-actions">
        <button 
          className="sidebar-settings-btn"
          onClick={onSettingsClick}
          title="Settings"
        >
          <SettingsIcon color="inherit" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

export default Navbar;