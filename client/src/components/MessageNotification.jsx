import React, { useEffect } from "react";
import { useSocket } from "./contexts/SocketContext";
import { useAlert } from "./contexts/AlertContext";
import { useAuth } from "./contexts/AuthContext";

const MessageNotification = () => {
    const { socket } = useSocket();
    const { showAlert } = useAlert();
    const { user } = useAuth(); // Get current user info

    useEffect(() => {
        if (!socket) return;

        // Define the event handler for incoming messages
        const handleIncomingMessage = ({ message, username }) => {

            // Avoid showing notification if the current user is the sender
            if (message.sender_id === user?.userId) return;

            console.info("New message received:", message);
            // You can customize the notification message and type
            const notificationText = `${username}: ${message.text}`;
            showAlert(notificationText, "info");
        };

        // Listen for the "message" event from the server
        socket.on("message", handleIncomingMessage);

        // Cleanup the event listener when the component unmounts
        return () => {
            socket.off("message", handleIncomingMessage);
        };
    }, [socket, showAlert, user]);

    return null; // This component only handles notifications
};

export default MessageNotification;
