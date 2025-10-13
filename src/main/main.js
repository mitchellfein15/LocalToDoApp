const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Configure app paths and cache directories
app.setPath('userData', path.join(app.getPath('appData'), 'LocalToDoApp'));
app.setPath('temp', path.join(app.getPath('temp'), 'LocalToDoApp'));

// Start the Express server
require('../server/server.js');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, '../../public/calendar_icon_176372.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      // Add these settings to help with cache issues
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
}

// Handle app ready event
app.whenReady().then(() => {
  // Set additional app configurations
  app.commandLine.appendSwitch('--disable-gpu-cache');
  app.commandLine.appendSwitch('--disable-disk-cache');
  app.commandLine.appendSwitch('--disable-application-cache');
  
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 