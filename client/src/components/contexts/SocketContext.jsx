import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext"; // Make sure AuthContext is correctly imported

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user || !user.userId) {
            console.warn("⚠️ No user logged in, not connecting to socket.");
            return;
        }

        console.info("🚀 Connecting to socket...");
        const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
            transports: ["websocket", "polling"], // Ensures stable connection
            withCredentials: true, // Allows sending auth cookies (if needed)
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        setSocket(newSocket);
        newSocket.on("connect", () => {
            console.info("✅ Socket connected:", newSocket.id);
            // Notify server that user is online
            newSocket.emit("user_connected", { userId: user.userId });
        });

        newSocket.on("disconnect", () => {
            console.warn("❌ Socket disconnected");
        });

        return () => {
            console.info("🛑 Cleaning up socket...");
            newSocket.disconnect(); // Prevent multiple sockets
        };
    }, [user]);

    // 🔥 Memoizing the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({ socket }), [socket]);
    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
