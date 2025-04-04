import React, { useEffect } from "react";
import { useSocket } from "./contexts/SocketContext";
import { useAlert } from "./contexts/AlertContext";
import { useAuth } from "./contexts/AuthContext";

const OnlineUserNotification = () => {
    const { socket } = useSocket();
    const { showAlert } = useAlert();
    const { user } = useAuth(); // Get current user info

    useEffect(() => {
        if (!socket) return;

        const handleUserOnline = ({ userId, username }) => {

            // Avoid showing notification if the current user is the sender
            if (userId === user?.userId) return;

            console.info(`User ID: ${userId} is online`); // Logging the user ID for debugging
            showAlert(`${username} is now online!`, "success");
        };

        socket.on("user_online", handleUserOnline);

        return () => {
            socket.off("user_online", handleUserOnline);
        };
    }, [socket, showAlert, user]);

    return null; // This component only listens for events
};

export default OnlineUserNotification;