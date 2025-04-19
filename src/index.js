// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
// import { AppProvider } from './pages/StateManagement/Context';
import { AppProvider } from './context/Context';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

reportWebVitals();