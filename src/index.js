// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Use 'react-dom/client' for React 18 and later
import App from './App';

// Create a root element and render the App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
