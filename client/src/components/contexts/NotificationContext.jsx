import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a notification object (could include id, text, and any other data)
  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);
  };

  // Clear all notifications
  const resetNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        resetNotifications,
        notificationCount: notifications.length,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
