import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import TodoList from './components/TodoList';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <TodoList />
      </div>
    </ThemeProvider>
  );
}

export default App; 