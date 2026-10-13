import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppRouter } from './app/router';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <WatchlistProvider>
            <AppRouter />
          </WatchlistProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
