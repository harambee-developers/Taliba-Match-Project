import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { Send, User } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useAuth } from './contexts/AuthContext';
import { useSocket } from "./contexts/SocketContext";
import axios from 'axios';

export default function ChatApp() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [receiverName, setReceiverName] = useState([])
    const [receiverId, setReceiverId] = useState(null)
    const { user } = useAuth()
    const { socket } = useSocket()
    const { conversationId } = useParams(); // This will pull the conversationId and current userId param from the URL
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(false)
    const [lastSeen, setLastSeen] = useState(null);

    const sendMessage = () => {
        if (!input.trim()) return; // Prevent sending empty messages
        if (!receiverId) {
            console.error("Receiver ID is missing!");
            return;
        }

        const messageData = {
            text: input,
            sender_id: user.userId,
            receiver_id: receiverId,
            conversation_id: conversationId,
            createdAt: new Date().toISOString()
        };

        console.log("Sending message: ", messageData);

        // Ensure message is sent only once
        socket.emit("send_message", messageData);

        // Emit "stop_typing" when sending a message
        socket.emit("stop_typing", { conversationId, senderId: user.userId });

        setInput(""); // Clear input after sending
    };

    const fetchConversationDetails = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/message/${conversationId}/details`);
            if (!response.data || !response.data.participants) {
                console.error("Invalid conversation data received");
                return;
            }

            // Find the receiver (the participant that is NOT the current user)
            const receiver = response.data.participants.find(otherUser => otherUser._id !== user.userId);

            if (receiver && receiver._id !== receiverId) { //  Update state only if it changes
                setReceiverId(receiver._id);
                setReceiverName([receiver.userName, receiver.firstName, receiver.lastName]);
            }
        } catch (error) {
            console.error("Error fetching conversation details:", error);
        }
    };

    // Format the last seen text
    const formattedLastSeen = lastSeen
        ? isToday(new Date(lastSeen))
            ? `Last seen today at ${new Date(lastSeen).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            })}`
            : `Last seen ${format(new Date(lastSeen), 'MMM d, yyyy')}`
        : null;

    const groupMessagesByDate = (messages) => {
        return messages.reduce((acc, message) => {
            const messageDate = new Date(message.createdAt);

            let formattedDate;
            if (isToday(messageDate)) {
                formattedDate = "Today";
            } else if (isYesterday(messageDate)) {
                formattedDate = "Yesterday";
            } else {
                formattedDate = format(messageDate, "EEEE, MMMM d"); // Example: "Thursday, March 14"
            }

            if (!acc[formattedDate]) {
                acc[formattedDate] = []; // Ensure it is an array
            }
            acc[formattedDate].push(message);
            return acc;
        }, {}); // Ensure it returns an object
    };

    const fetchMessages = async (conversationId) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/message/${conversationId}/messages`);
            const groupMessage = groupMessagesByDate(response.data.messages)
            setMessages(groupMessage);
        } catch (error) {
            console.error('Error fetching messages', error.message);
        }
    };

    // Emit "typing" event when user starts typing
    const handleTyping = () => {
        socket.emit("typing", { conversationId, senderId: user.userId });
    };

    // Emit "stop_typing" event when user stops typing
    const handleStopTyping = () => {
        setTimeout(() => {
            socket.emit("stop_typing", { conversationId, senderId: user.userId });
        }, 1000);
    };

    useEffect(() => {

        if (!socket) {
            console.warn("Socket not connected yet.");
            return;
        }
        if (!conversationId || !user || !user.userId) return; // Prevent running if conversationId or user data is not available

        fetchMessages(conversationId);
        fetchConversationDetails();

        socket.emit("join_chat", { userId: user.userId, conversationId });

        // Emit event to check if the recipient is online
        socket.emit("check_user_online", { userId: receiverId });

        const handleNewMessage = (newMessage) => {
            setMessages((prevMessages) => {
                if (!prevMessages || typeof prevMessages !== "object") {
                    prevMessages = {}; // ✅ Ensure it's always an object
                }

                // ✅ Group messages correctly after adding a new one
                const updatedMessages = groupMessagesByDate([...Object.values(prevMessages).flat(), newMessage]);
                return updatedMessages;
            });
        };

        socket.on("message", handleNewMessage);

        // Listen for online status updates
        socket.on("user_online", (data) => {
            if (data.userId === receiverId) {
                setIsOnline(true);
                setLastSeen(null)
            }
        });

        // Listen for offline status updates
        socket.on("user_offline", (data) => {
            if (data.userId === receiverId) {
                setIsOnline(false);
                setLastSeen(data.lastSeen)
            }
        });

        // Listen for offline status updates
        socket.on("messages_read", ({ conversationId, receiverId }) => {
            // Update local state to mark messages as read in the UI
            setMessages((prevMessages) => {
                if (!prevMessages || typeof prevMessages !== "object") return prevMessages;

                // Loop through and update message status where applicable
                const updatedMessages = Object.keys(prevMessages).reduce((acc, key) => {
                    acc[key] = prevMessages[key].conversation_id === conversationId &&
                        prevMessages[key].receiver_id === receiverId
                        ? { ...prevMessages[key], status: "Read" }
                        : prevMessages[key];
                    return acc;
                }, {});

                return updatedMessages;
            });
        });

        socket.on('typing', (data) => {
            if (data.senderId !== user.userId) {
                setIsTyping(true);
            }
        })

        socket.on('stop_typing', (data) => {
            if (data.senderId !== user.userId) {
                setIsTyping(false);
            }
        })

        return () => {
            socket.off("message", handleNewMessage); // Cleanup listener on unmount
            socket.off("messages_read")
            socket.off("check_users_online")
            socket.off("typing");
            socket.off("stop_typing");
            socket.off("user_online");
            socket.off("user_offline");
        };
    }, [conversationId, user, receiverId, socket]); // Runs only when `conversationId` or 'userId' changes                                                                           

    // If user is not yet available, render a loading state or nothing.
    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-white w-full border-4 border-[#203449]">

            <div className="ml-10 p-2 text-xl font-bold bg-[#FFF1FE] text-black border-4 border-[#E01D42] rounded-xl inline-flex items-center space-x-4 m-6 w-fit">
                {/* User Image */}
                <User className="w-12 h-12 text-black" />

                {/* Right Side: Name and Status */}
                <div className="flex flex-col items-start">
                    {/* User Name */}
                    <span className="text-lg font-semibold">
                        {user ? `${receiverName[1]} ${receiverName[2]}` : "Loading..."}
                    </span>

                    {/* Last Seen - Only show if user is offline */}
                    {!isOnline && lastSeen && (
                        <span className="text-sm text-gray-500">
                            {formattedLastSeen}
                        </span>
                    )}
                </div>

                {/* Online/Offline Dot - Green Dot to the Right */}
                {isOnline && (
                    <div className="ml-2">
                        <span className="w-3 h-3 rounded-full inline-block bg-green-500"></span>
                    </div>
                )}
            </div>

            {/* Message Area */}
            <div className="flex-1 p-10 md:ml-10 overflow-y-auto">
                {Object.keys(messages).length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-gray-400 text-center">Why not introduce yourself?</p>
                    </div>
                ) : (
                    Object.entries(messages).map(([date, msgs], dateIndex) => (
                        <div key={dateIndex}>
                            {/* Date Separator */}
                            <div className="text-center text-gray-500 font-semibold my-4">{date}</div>

                            {msgs.map((msg, index) => (
                                <div key={index} className="flex items-start mb-4 w-full">
                                    {/* Sender Name - Fixed on the left */}
                                    <div className="text-sm font-semibold text-black min-w-max pr-2">
                                        {msg.sender_id === user.userId ? "You:" : receiverName[1]}
                                    </div>

                                    {/* Message Container - Expands fully to the right */}
                                    <div className={`flex-1 rounded-xl px-3 py-2 ${msg.sender_id === user.userId ? "bg-[#FFF1FE] text-black border-4 border-[#203449]" : "bg-[#FFF1FE] text-black border-4 border-red-600"}`}>
                                        <p className="font-semibold">{msg.text}</p>
                                    </div>

                                    {/* Timestamp & Status - Aligned to the right */}
                                    <div className="ml-2 text-sm text-gray-600">
                                        <span>
                                            {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        {index === msgs.length - 1 && msg.sender_id === user.userId && (
                                            <p className="text-xs text-[#203449]">{msg.status}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}

                {/* ✅ Show Typing Indicator */}
                {isTyping && (
                    <div className="text-[#203449] text-sm italic">💬 {receiverName[1]} is typing...</div>
                )}
            </div>
            {/* Fixed Send Message Section */}
            <div className="md:p-10 flex items-center bg-white m-6">
                <input
                    type="text"
                    name="chatbox"
                    id="chatbox"
                    className="flex-1 p-2 bg-[#fef2f2] text-black rounded-lg focus:outline-none border-4 hover:bg-white transition-all duration-300"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => { setInput(e.target.value); handleTyping(); handleStopTyping(); }}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    className="ml-2 mr-2 p-2 bg-white text-[#203449] rounded-lg "
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
