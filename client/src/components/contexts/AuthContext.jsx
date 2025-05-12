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
   * Attempts to refresh the user's access token using a stored refresh token.
   *
   * @async
   * @function
   * @returns {Promise<boolean>} True if refresh succeeded, false otherwise.
   */
    const refreshToken = useCallback(async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh-token`);
        console.log("🔁 Token refreshed:", res.data.token);
        return true;
      } catch (err) {
        console.error("❌ Refresh token failed:", err);
        return false;
      }
    }, []);

/**
   * Verifies the authentication token and retrieves user details.
   *
   * @async
   * @function
   * @returns {Promise<{ userId: string, username: string, email: string, role: string } | null>}
   */
const verifyToken = useCallback(async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-token`);
    if (res.status === 200 && res.data.valid) {
      const { userId, username, email, role } = res.data;
      const verifiedUser = { userId, username, email, role };
      setUser(verifiedUser);
      return verifiedUser;
    } else {
      throw new Error("Token verification failed");
    }
  } catch (err) {
    console.warn("🔒 Token expired or invalid, attempting refresh...");
    const refreshed = await refreshToken();
    if (refreshed) {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-token`);
        if (res.status === 200 && res.data.valid) {
          const { userId, username, email, role } = res.data;
          const verifiedUser = { userId, username, email, role };
          setUser(verifiedUser);
          return verifiedUser;
        }
      } catch (err2) {
        console.error("Token re-verification after refresh failed:", err2);
      }
    }
    setUser(null);
    return null;
  }
}, [refreshToken]);

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
  const lowerCaseEmail = email.trim().toLowerCase(); // Normalize email
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
      { email: lowerCaseEmail, password }
    );

    if (response.status === 200) {
      const { isDefaultPassword, redirect, resetToken} = response.data;

      // If user logged in with default password, redirect to profile update with resetToken
      if (isDefaultPassword) {
        window.location.href = `/profile-update/${resetToken}`;
        return; // Stop further execution
      }

      // Re-verify token and fetch user data after login
      await verifyTokenAndFetchData();

      // Notify backend of the user connection
      if (socket && user) {
        socket.emit('user_connected', { userId: user.userId });
      }

      // Redirect based on user's role (optional)
      if (redirect) {
        window.location.href = redirect;
      }

    } else {
      throw new Error("Login failed!");
    }
  } catch (error) {
    console.error("Login error:", error);

    // Handle server errors better
    let errorMessage = "Unable to connect to the server. Please try again.";
    if (error.response && error.response.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
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

     /**
   * Sends a password reset email by calling the backend endpoint.
   * The backend endpoint should handle email generation and sending.
   *
   * @param {string} email - The email address of the user who wants to reset their password.
   * @returns {Promise<Object>} - Returns response data if successful.
   * @throws {Error} - Throws an error if the process fails.
   */
     const resetPassword = async (email) => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`,
          { email }
        );
        if (response.status === 200) {
          console.log("Reset password email sent");
          return response.data;
        } else {
          throw new Error("Reset password failed!");
        }
      } catch (error) {
        console.error("Reset password error:", error);
        throw new Error("Reset password process failed!");
      }
    };
  
    /**
     * Changes the user's password.
     *
     * @param {string} oldPassword - The user's current password.
     * @param {string} newPassword - The new password the user wants to set.
     * @returns {Promise<Object>} - The response data from the backend.
     * @throws {Error} - Throws an error if the password change process fails.
     */
    const changePassword = async (token, newPassword) => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/change-password/${token}`,
          { newPassword }
        );
        if (response.status === 200) {
          console.log("Password changed successfully");
          return response.data;
        } else {
          throw new Error("Change password failed!");
        }
      } catch (error) {
        console.error("Change password error:", error);
        throw new Error("Change password process failed!");
      }
    };

  // 🔥 Memoizing the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ user, loading, login, logout, resetPassword, changePassword }), [user]);

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


