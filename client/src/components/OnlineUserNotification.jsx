import React, { useEffect } from "react";
import { useSocket } from "./contexts/SocketContext";
import { useAlert } from "./contexts/AlertContext";

const OnlineUserNotification = () => {
    const { socket } = useSocket();
    const { showAlert } = useAlert();

    useEffect(() => {
        if (!socket) return;

        const handleUserOnline = ({ userId, username }) => {
            console.info(`User ID: ${userId} is online`); // Logging the user ID for debugging
            showAlert(`${username} is now online!`, "success");
        };

        socket.on("user_online", handleUserOnline);

        return () => {
            socket.off("user_online", handleUserOnline);
        };
    }, [socket, showAlert]);

    return null; // This component only listens for events
};

export default OnlineUserNotification;