import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';
import { DatabaseProvider } from './providers/DatabaseProvider.jsx';
import { AuthProvider } from './providers/AuthProvider.jsx';
import { UIProvider } from './providers/UIProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DatabaseProvider>
      <AuthProvider>
        <UIProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </UIProvider>
      </AuthProvider>
    </DatabaseProvider>
  </React.StrictMode>
);
