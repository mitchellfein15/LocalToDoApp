import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Switch, 
  FormControlLabel, 
  Typography,
  Box,
  Divider,
  Button,
  DarkMode, 
  LightMode, 
  SettingsIcon
} from '../utils/mui-imports';
import ApiService from '../services/api';
import './Settings.css';

function Settings({ open, onClose }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleResetStats = async () => {
    try {
      await ApiService.resetStats();
      setConfirmOpen(false);
      // Reload the page to refresh the dashboard widgets with cleared data
      window.location.reload(); 
    } catch (error) {
      console.error('Failed to reset stats:', error);
    }
  };

  return (
    <>
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
                  {isDarkMode ? <DarkMode color="inherit" /> : <LightMode color="inherit" />}
                  <Typography>
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </Typography>
                </Box>
              }
              className="theme-toggle"
            />
          </Box>
          
          <Divider className="settings-divider" style={{ margin: '20px 0' }} />
          
          {/* New Data Management Section */}
          <Box className="settings-section">
            <Typography variant="h6" className="section-title">
              Data Management
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: '10px' }}>
              Resetting your statistics will clear your productivity heatmap and quick stats.
            </Typography>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => setConfirmOpen(true)}
            >
              Reset Statistics
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Reset Statistics?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all your statistics? This will clear your task completion history. <strong>This action cannot be undone.</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleResetStats} color="error" variant="contained">
            Confirm Reset
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Settings;