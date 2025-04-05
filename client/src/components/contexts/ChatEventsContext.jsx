// ChatEventsContext.js
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { cacheData, getCachedData } from "../../utils/cacheUtil"
import axios from "axios";

const ChatEventsContext = createContext({});

export const ChatEventsProvider = ({ conversationId, children }) => {

    const { socket } = useSocket();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [receiverStatus, setReceiverStatus] = useState({ isOnline: false, lastSeen: null });
    const [receiverId, setReceiverId] = useState(null);
    const [receiverName, setReceiverName] = useState([]);

    const CACHE_KEY_MESSAGES = `chat_messages_${conversationId}`;
    const CACHE_KEY_DETAILS = `chat_details_${conversationId}`
    const CACHE_STATUS = `chat_status_${receiverId}`
    const chatCache = "chat-cache"

    useEffect(() => {
        const fetchReceiverStatus = async () => {
            const cachedStatus = await getCachedData(CACHE_STATUS, chatCache);
            if (cachedStatus) {
                console.info("✅ Loaded status from cache");
                setReceiverStatus({ isOnline: cachedStatus.isOnline, lastSeen: cachedStatus.lastSeen });
                return;
            }
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/message/fetch-status/${receiverId}`)
                setReceiverStatus({ isOnline: res.data.isOnline, lastSeen: res.data.lastSeen });
                cacheData(CACHE_STATUS, res.data, chatCache)
            } catch (error) {
                console.error("Error fetching messages", error.message);
            }
        }

        if (receiverId) {
            fetchReceiverStatus()
        }
    }, [receiverId])

    // 📦 Fetch and cache messages and details
    useEffect(() => {
        if (!conversationId) return;

        const fetchMessages = async () => {
            const cacheKey = `chat_messages_${conversationId}`;
            const cached = await getCachedData(cacheKey, chatCache);
            if (cached) {
                setMessages(cached);
                return;
            }

            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/message/${conversationId}/messages`);
                setMessages(res.data.messages);
                cacheData(cacheKey, res.data.messages, chatCache);
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };

        // Fetch conversation details and set receiver information
        const fetchConversationDetails = async () => {
            const cachedDetails = await getCachedData(CACHE_KEY_DETAILS, 'chat-cache');
            if (cachedDetails) {
                setReceiverId(cachedDetails._id);
                setReceiverName([cachedDetails.userName, cachedDetails.firstName, cachedDetails.lastName]);
                return;
            }

            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/message/${conversationId}/details`
                );
                if (!response.data || !response.data.participants) {
                    console.error("Invalid conversation data received");
                    return;
                }
                // Find the receiver (the participant that is NOT the current user)
                const receiver = response.data.participants.find(
                    (otherUser) => otherUser._id !== user?.userId
                );
                if (receiver && receiver._id !== receiverId) {
                    setReceiverId(receiver._id);
                    setReceiverName([receiver.userName, receiver.firstName, receiver.lastName]);
                    cacheData(CACHE_KEY_DETAILS, receiver, 'chat-cache');
                }
            } catch (error) {
                console.error("Error fetching conversation details:", error);
            }
        };
        
        fetchConversationDetails()
        fetchMessages();
        

    }, [conversationId]);

    useEffect(() => {
        if (!socket || !user || !conversationId) return;

        const handleNewMessage = ({ message }) => {
            setMessages((prev) => {
                const updatedMessages = [...prev, message]
                cacheData(CACHE_KEY_MESSAGES, updatedMessages, chatCache);
                return updatedMessages
            });
        };

        const handleTyping = (data) => {
            if (data.senderId !== user.userId && data.conversationId === conversationId) {
                setIsTyping(true);
            }
        };

        const handleStopTyping = (data) => {
            if (data.senderId !== user.userId && data.conversationId === conversationId) {
                setIsTyping(false);
            }
        };

        const handleUserOnline = () => {
            setReceiverStatus({ isOnline: true, lastSeen: null });
        };

        const handleUserOffline = (data) => {
            setReceiverStatus({ isOnline: false, lastSeen: data.lastSeen });
        };

        const handleMessagesRead = ({ conversationId: incomingId, receiverId }) => {
            setMessages((prevMessages) => {
                if (!Array.isArray(prevMessages)) return prevMessages;
                return prevMessages.map(message => {
                    if (
                        message.conversation_id === incomingId &&
                        message.receiver_id === receiverId
                    ) {
                        return { ...message, status: "Read" };
                    }
                    return message;
                });
            });
        };

        socket.on('messages_read', handleMessagesRead)
        socket.on('message', handleNewMessage);
        socket.on('typing', handleTyping);
        socket.on('stop_typing', handleStopTyping);
        socket.on('user_online', handleUserOnline);
        socket.on('user_offline', handleUserOffline);

        return () => {
            socket.off('message', handleNewMessage);
            socket.off('typing', handleTyping);
            socket.off('stop_typing', handleStopTyping);
            socket.off('user_online', handleUserOnline);
            socket.off('user_offline', handleUserOffline);
            socket.off('messages_read', handleMessagesRead)
        };
    }, [socket, user, conversationId]);

    const value = useMemo(() => {
        return { messages, isTyping, receiverStatus, receiverId, receiverName };
    }, [messages, isTyping, receiverStatus, receiverId, receiverName]);

    return (
        <ChatEventsContext.Provider value={value}>
            {children}
        </ChatEventsContext.Provider>
    );
};

export const useChatEvents = () => useContext(ChatEventsContext);
