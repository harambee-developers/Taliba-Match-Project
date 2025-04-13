import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios'
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();
  const { user } = useAuth()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${user.userId}`, {
          withCredentials: true
        });
        console.table(res.data)
        if (res.data && Array.isArray(res.data.notifications)) {
          setNotifications(res.data.notifications);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    if (user && user.userId) {
      fetchNotifications();
    }
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/mark-all-read/${user.userId}`,
        {},
        { withCredentials: true }
      );

      // Update all locally
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Update on server
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/read/${notificationId}`,
        {},
        { withCredentials: true }
      );

      // Update locally
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Add a notification object (could include id, text, and any other data)
  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);
  };

  // Clear all notifications
  const resetNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    if (!socket && !user) return;

    const handleNewNotification = (notification) => {
      // Call your local state handler to store the new notification
      addNotification(notification);
    };

    // Listen for incoming notifications
    socket.on("new_notification", handleNewNotification);

    // Clean up listener on unmount or socket change
    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        resetNotifications,
        markAsRead,
        markAllAsRead,
        notificationCount: notifications.filter(n => !n.isRead).length,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
