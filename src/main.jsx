// src/main.jsx - VERSIÓN ESTÁNDAR Y ROBUSTA

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Importamos la configuración de i18next para que se inicialice.
import './i18next.js'; 

// Importamos el CSS principal.
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);