import React, { useEffect, useState } from "react";
import { useSocket } from "./contexts/SocketContext";
import { useAlert } from "./contexts/AlertContext";
import { useAuth } from "./contexts/AuthContext";
import { getCachedData, cacheData } from '../utils/cacheUtil';

const OnlineUserNotification = () => {
    const { socket } = useSocket();
    const { showAlert } = useAlert();
    const { user } = useAuth(); // Get current user info
    const [matchedUserIds, setMatchedUserIds] = useState([]);

    const chatCache = "chat-cache";
    const CACHE_MATCHES = `chat_matches`;

    // Fetch the user's matched IDs from your backend
    // (Assumes an endpoint like /api/matches/:userId returns an array of match objects)
    useEffect(() => {
        const fetchMatches = async () => {
            const cached = await getCachedData(CACHE_MATCHES, chatCache);
            if (cached) {
                const cachedIds = cached
                .filter(match => match.match_status === "Interested")
                .map(match =>
                    match.sender_id === user.userId ? match.receiver_id : match.sender_id
                );
                setMatchedUserIds(cachedIds)
                return;
            }
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/match/matches/${user.userId}`, {
                    credentials: "include",
                    headers: { 'Accept': 'application/json' }
                });
                if (!res.ok) {
                    throw new Error(`Failed to fetch matches: ${res.statusText}`);
                }
                const data = await res.json();
                // Assuming your match objects include sender_id, receiver_id, and a status field.
                // Filter for confirmed matches (e.g. match_status === "Interested" or another approved status)
                // and extract the IDs of the other party in each match.
                const ids = data
                    .filter(match => match.match_status === "Interested")
                    .map(match =>
                        match.sender_id === user.userId ? match.receiver_id : match.sender_id
                    );
                setMatchedUserIds(ids);
                await cacheData(CACHE_MATCHES, data, chatCache);
            } catch (error) {
                console.error("Error fetching matches:", error);
            }
        };

        if (user && user.userId) {
            fetchMatches();
        }
    }, [user]);

    useEffect(() => {
        if (!socket) return;

        const handleUserOnline = ({ userId, username }) => {

            // Only show notification if the online user is a match
            if (matchedUserIds.includes(userId)) {
                console.info(`${username} is now online!`)
                showAlert(`${username} is now online!`, "success");
            }
        };

        socket.on("user_online", handleUserOnline);

        return () => {
            socket.off("user_online", handleUserOnline);
        };
    }, [socket, showAlert, user]);

    return null; // This component only listens for events
};

export default OnlineUserNotification;