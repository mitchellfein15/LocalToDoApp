import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Switch, 
  FormControlLabel, 
  Typography,
  Box,
  Divider
} from '@mui/material';
import { 
  DarkMode, 
  LightMode, 
  Settings as SettingsIcon 
} from '@mui/icons-material';
import './Settings.css';

function Settings({ open, onClose }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className="settings-dialog"
    >
      <DialogTitle className="settings-title">
        <SettingsIcon className="settings-icon" />
        Settings
      </DialogTitle>
      
      <DialogContent className="settings-content">
        <Box className="settings-section">
          <Typography variant="h6" className="section-title">
            Appearance
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
                color="primary"
              />
            }
            label={
              <Box className="theme-toggle-label">
                {isDarkMode ? <DarkMode /> : <LightMode />}
                <Typography>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </Typography>
              </Box>
            }
            className="theme-toggle"
          />
        </Box>
        
        <Divider className="settings-divider" />
        
        <Box className="settings-section">
          <Typography variant="h6" className="section-title">
            Future Settings
          </Typography>
          <Typography variant="body2" color="textSecondary">
            More settings will be added here in the future.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default Settings; 