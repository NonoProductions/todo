import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '../style.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker erfolgreich registriert:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker Registrierung fehlgeschlagen:', error);
      });
  });
}

