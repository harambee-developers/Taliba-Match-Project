import React, { createContext, useState, useContext } from "react";

/**
 * Context for managing alert notifications.
 * Provides methods to show and hide alerts.
 */
const AlertContext = createContext();

/**
 * AlertProvider component to wrap around the app or specific parts
 * where alerts need to be displayed.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The child components.
 * @returns {JSX.Element} The provider component that manages alert state.
 */
export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  /**
   * Displays an alert message.
   *
   * @function
   * @param {string} message - The alert message to display.
   * @param {"info" | "success" | "warning" | "error"} [type="info"] - Type of alert (defaults to "info").
   */
  const showAlert = (message, type = "info") => {
    setAlert({ message, type });

    // Auto-hide alert after 3 seconds
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  /**
   * Hides the currently displayed alert.
   *
   * @function
   */
  const hideAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

/**
 * Custom hook to access the alert context.
 *
 * @function
 * @returns {{ alert: { message: string, type: string } | null, showAlert: Function, hideAlert: Function }} 
 * The alert state and functions to show or hide alerts.
 */
export const useAlert = () => useContext(AlertContext);
