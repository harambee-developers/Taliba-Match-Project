// ThemeContext.js
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.gender === 'Male') {
      document.body.setAttribute('data-theme', 'Male');
    } else {
      document.body.setAttribute('data-theme', 'Female');
    }
  }, [user]);

  return (
    <ThemeContext.Provider value={{}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
