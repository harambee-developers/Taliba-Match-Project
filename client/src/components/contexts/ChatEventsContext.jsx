import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const ChatEventsContext = createContext({});

export const ChatEventsProvider = ({ children }) => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [isTyping, setIsTyping] = useState({isTyping: false, conversationId: null});

    // 5. Socket listeners
    useEffect(() => {
        if (!socket || !user) return;

        const handleTyping = ({ senderId, conversationId }) => {
            if (senderId !== user.userId) 
            console.log("Typing event...", conversationId)
            setIsTyping({isTyping: true, conversationId});
        };

        const handleStopTyping = ({ senderId, conversationId }) => {
            if (senderId !== user.userId)
            console.log("User has stopped typing event...")
            setIsTyping({isTyping: false, conversationId});
        };

        socket.on("typing", handleTyping);
        socket.on("stop_typing", handleStopTyping);

        return () => {
            socket.off("typing", handleTyping);
            socket.off("stop_typing", handleStopTyping);
        };
    }, [socket, user]);

    // 6. Memoized context value
    const value = useMemo(() => ({
        isTyping,
    }), [isTyping]);

    return (
        <ChatEventsContext.Provider value={value}>
            {children}
        </ChatEventsContext.Provider>
    );
};

export const useChatEvents = () => useContext(ChatEventsContext);
