const path = require('path');
const fs = require('fs');

// Determine if we're in development or production
const isDev = process.env.NODE_ENV === 'development' || !process.env.APPDATA;

let dbPath;

if (isDev) {
  // In development, use the database folder
  dbPath = path.join(__dirname, 'todo.db');
} else {
  // In production, use the user's app data directory
  const userDataPath = path.join(process.env.APPDATA, 'Local Todo App');
  
  // Create the directory if it doesn't exist
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  
  dbPath = path.join(userDataPath, 'todo.db');
}

module.exports = { dbPath, isDev }; 