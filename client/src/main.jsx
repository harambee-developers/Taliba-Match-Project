import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './components/contexts/AuthContext.jsx'
import { AlertProvider } from './components/contexts/AlertContext.jsx'
import { SocketProvider } from './components/contexts/SocketContext.jsx'
import { NotificationProvider } from './components/contexts/NotificationContext.jsx'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './components/contexts/ThemeProvider.jsx'


// Allows deeply nested context objects
const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SocketProvider>
          <NotificationProvider>
            <AlertProvider>
              {children}
            </AlertProvider>
          </NotificationProvider>
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
