import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useSocket } from "./SocketContext";

/**
 * Context for authentication management.
 * Provides user state, login, logout, and token verification.
 */
const AuthContext = createContext();

/**
 * AuthProvider component that manages authentication state.
 * Wraps around the application or parts where authentication is required.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The child components.
 * @returns {JSX.Element} The authentication provider component.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();  // Access socket from SocketContext here

  // Ensure Axios sends cookies with every request
  axios.defaults.withCredentials = true;

  /**
   * Verifies the authentication token and retrieves user details.
   *
   * @async
   * @function
   * @returns {Promise<{ userId: string, username: string, email: string, role: string } | null>}
   * Returns user object if verification is successful, otherwise returns null.
   */
  const verifyToken = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-token`);
      if (response.status === 200 && response.data.valid) {
        const { userId, username, email, role } = response.data;
        const verifiedUser = { userId, username, email, role };
        setUser(verifiedUser); // Update user state
        console.log("Token verification successful:", verifiedUser);
        return verifiedUser; // Return verified user object
      } else {
        throw new Error("Token verification failed");
      }
    } catch (error) {
      console.error("Token verification error:", error);
      setUser(null); // Clear user on failure
      return null;
    }
  }, []);

  /**
   * Verifies the token and fetches additional user data if authenticated.
   *
   * @async
   * @function
   */
  const verifyTokenAndFetchData = async () => {
    setLoading(true); // Start loading
    const verifiedUser = await verifyToken();
    if (verifiedUser) {
      try {
        const results = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/user/${verifiedUser.userId}`);
        setUser({ ...verifiedUser, ...results.data }); // Merge verified user and fetched data
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null); // Clear user data if fetching fails
      }
    }
    setLoading(false); // End loading
  };

  /**
   * Runs authentication check on component mount.
   */
  useEffect(() => {
    verifyTokenAndFetchData();
  }, []);

  /**
   * Logs in the user by verifying credentials.
   *
   * @async
   * @function
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @throws {Error} Throws an error if login fails.
   */
  const login = async (email, password) => {
    const lowerCaseEmail = email.trim().toLowerCase(); // Convert email to lowercase and trim spaces
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, { email: lowerCaseEmail, password });
      if (response.status === 200) {
        // Emit the disconnect event before logging out
        await verifyTokenAndFetchData(); // Re-verify token and fetch user data after login

        if (socket && user) {
          socket.emit('user_connected', { userId: user.userId });  // This will trigger the backend to handle user disconnection
        }
      } else {
        throw new Error("Login failed!");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login process failed!");
    }
  };

  /**
   * Logs out the user and clears authentication state.
   *
   * @async
   * @function
   */
  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`);

      // Emit the disconnect event before logging out
      if (socket) {
        socket.emit('disconnect');  // This will trigger the backend to handle user disconnection
      }

      setUser(null); // Clear user state
      // clear cache
      const cache = await caches.open('chat-cache') 
      const keys = await cache.keys(); // Get all cached requests
      await Promise.all(keys.map((key) => cache.delete(key))); // Delete each request
      
      console.log("✅ All cache cleared!");
      console.log("Logout successful!");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // 🔥 Memoizing the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ user, loading, login, logout }), [user]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to access authentication context.
 *
 * @function
 * @returns {{ user: { userId: string, username: string, email: string, role: string } | null, login: Function, logout: Function }}
 * Returns authentication state and functions to manage login/logout.
 */
export const useAuth = () => useContext(AuthContext);


