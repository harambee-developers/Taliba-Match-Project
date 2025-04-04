import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send, ChevronLeft } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useAuth } from "./contexts/AuthContext";
import { useSocket } from "./contexts/SocketContext";
import axios from "axios";
import TypingIndicator from "./TypingIndicator";

export default function ChatApp({ conversation, user_id, onLastMessageUpdate }) {
    // State variables
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [receiverName, setReceiverName] = useState([]);
    const [receiverId, setReceiverId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [lastSeen, setLastSeen] = useState(null);

    const navigate = useNavigate()
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Get user from AuthContext and socket from SocketContext
    const { user } = useAuth();
    const { socket } = useSocket();

    // Use URL params as a fallback if props are null
    const { conversationId: conversationIdFromParams } = useParams();
    const currentConversationId = conversation || conversationIdFromParams;
    const currentUserId = user_id || user?.userId;

    const CACHE_EXPIRY = 10 * 60 * 1000; // Cache expires in 10 min
    const CACHE_KEY_MESSAGES = `chat_messages_${currentConversationId}`;
    const CACHE_KEY_DETAILS = `chat_details_${currentConversationId}`;
    const CACHE_STATUS = `chat_status_${receiverName}`

    async function cacheData(key, data) {
        const cache = await caches.open("chat-cache");
        const response = new Response(JSON.stringify({ data, timestamp: Date.now() }), {
            headers: { "Content-Type": "application/json" },
        });
        await cache.put(key, response);
    }

    async function getCachedData(key) {
        const cache = await caches.open("chat-cache");
        const response = await cache.match(key);
        if (!response) return null;
        const { data, timestamp } = await response.json();
        return Date.now() - timestamp < CACHE_EXPIRY ? data : null;
    }

    // Send a message
    const sendMessage = () => {
        if (!input.trim()) return; // Prevent sending empty messages
        if (!receiverId) {
            console.error("Receiver ID is missing!");
            return;
        }
        const messageData = {
            text: input,
            sender_id: currentUserId,
            receiver_id: receiverId,
            conversation_id: currentConversationId,
            createdAt: new Date().toISOString(),
        };

        console.info("Sending message: ", messageData);

        socket.emit("send_message", messageData);
        socket.emit("stop_typing", { conversationId: currentConversationId, senderId: currentUserId });

        // Notify the parent component about the new message
        if (onLastMessageUpdate) {
            onLastMessageUpdate(currentConversationId, messageData.text, currentUserId);
        }
        setInput(""); // Clear input after sending

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100); // Delay slightly to allow rendering
    };

    // Fetch conversation details and set receiver information
    const fetchConversationDetails = async () => {
        const cachedDetails = await getCachedData(CACHE_KEY_DETAILS);
        if (cachedDetails) {
            setReceiverId(cachedDetails._id);
            setReceiverName([cachedDetails.userName, cachedDetails.firstName, cachedDetails.lastName]);
            return;
        }

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/message/${currentConversationId}/details`
            );
            if (!response.data || !response.data.participants) {
                console.error("Invalid conversation data received");
                return;
            }
            // Find the receiver (the participant that is NOT the current user)
            const receiver = response.data.participants.find(
                (otherUser) => otherUser._id !== currentUserId
            );
            if (receiver && receiver._id !== receiverId) {
                setReceiverId(receiver._id);
                setReceiverName([receiver.userName, receiver.firstName, receiver.lastName]);
                cacheData(CACHE_KEY_DETAILS, receiver);
            }
        } catch (error) {
            console.error("Error fetching conversation details:", error);
        }
    };

    // Format the last seen text
    const formattedLastSeen = lastSeen
        ? isToday(new Date(lastSeen))
            ? `Last seen today at ${new Date(lastSeen).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            })}`
            : `Last seen ${format(new Date(lastSeen), "MMM d, yyyy")}`
        : null;

    const groupMessagesByDate = (messages = []) => {
        if (!Array.isArray(messages)) return {}; // Ensure messages is an array

        return messages
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Sort by date
            .reduce((acc, message) => {
                if (!message?.createdAt) return acc; // Skip messages with no timestamp

                const messageDate = new Date(message.createdAt);
                let formattedDate;

                if (isToday(messageDate)) {
                    formattedDate = "Today";
                } else if (isYesterday(messageDate)) {
                    formattedDate = "Yesterday";
                } else {
                    formattedDate = format(messageDate, "EEEE, MMMM d");
                }

                acc[formattedDate] = acc[formattedDate] || [];
                acc[formattedDate].push(message);

                return acc;
            }, {});
    };

    const fetchReceiverStatus = async () => {
        const cachedStatus = await getCachedData(CACHE_STATUS);
        if (cachedStatus) {
            console.info("✅ Loaded status from cache");
            setIsOnline(cachedStatus.data.isOnline)
            setLastSeen(cachedStatus.data.lastSeen)
            return;
        }
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/message/fetch-status/${receiverId}`)
            setIsOnline(response.data.isOnline)
            setLastSeen(response.data.lastSeen)
            cacheData(CACHE_STATUS, response)
        } catch (error) {
            console.error("Error fetching messages", error.message);
        }
    }

    const fetchMessages = async (conversationId) => {
        const cachedMessages = await getCachedData(CACHE_KEY_MESSAGES);
        if (cachedMessages) {
            console.info("✅ Loaded messages from cache");
            if (!Array.isArray(cachedMessages)) {
                console.warn("Cached messages are not an array, clearing cache for this conversation.");
                setMessages([]);
                return;
            }
            setMessages(cachedMessages);
            return;
        }

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/message/${conversationId}/messages`
            );

            const messages = response.data.messages;
            setMessages(messages);
            cacheData(CACHE_KEY_MESSAGES, messages);

        } catch (error) {
            console.error("Error fetching messages", error.message);
        }
    };

    // Typing indicator events
    const handleTyping = () => {
        socket.emit("typing", { conversationId: currentConversationId, senderId: currentUserId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop_typing", { conversationId: currentConversationId, senderId: currentUserId });
        }, 2000);
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages])

    useEffect(() => {
        if (!receiverId || !socket || isOnline) return;

        fetchReceiverStatus();

        // Check online status only when mounting, not on every message send
        socket.emit("check_user_online", { userId: receiverId });

    }, [socket, receiverId, isOnline]) // Adds in dependencies to ensure that it doesnt fire often. ReceiverId is usually the culprit due to it undergoing constant updates


    useEffect(() => {
        if (!socket) {
            console.warn("Socket not connected yet.");
            return;
        }

        if (!currentConversationId || !currentUserId) return; // Ensure required data is available

        fetchMessages(currentConversationId);
        fetchConversationDetails();

        socket.emit("join_chat", { userId: currentUserId, conversationId: currentConversationId });

        const handleNewMessage = ({ message }) => {
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, message]
                cacheData(CACHE_KEY_MESSAGES, updatedMessages);
                return updatedMessages;
            });
            if (onLastMessageUpdate) {
                onLastMessageUpdate(currentConversationId, message.text, currentUserId);
            }
        };

        // Set up socket event listeners
        socket.on("message", handleNewMessage);

        socket.on("user_online", (data) => {
            if (data.userId === receiverId) {
                setIsOnline(true);
                setLastSeen(null);
            }
        });
        socket.on("user_offline", (data) => {
            if (data.userId === receiverId) {
                setIsOnline(false);
                setLastSeen(data.lastSeen);
            }
        });
        socket.on("messages_read", ({ conversationId, receiverId }) => {
            setMessages((prevMessages) => {
                if (!Array.isArray(prevMessages)) return prevMessages;
                return prevMessages.map(message => {
                    if (
                        message.conversation_id === conversationId &&
                        message.receiver_id === receiverId
                    ) {
                        return { ...message, status: "Read" };
                    }
                    return message;
                });
            });
        })
        socket.on("typing", (data) => {
            if (data.senderId !== currentUserId) {
                setIsTyping(true);
            }
        });
        socket.on("stop_typing", (data) => {
            if (data.senderId !== currentUserId) {
                setIsTyping(false);
            }
        });

        return () => {
            socket.off("message", handleNewMessage);
            socket.off("messages_read");
            socket.off("check_users_online");
            socket.off("typing");
            socket.off("stop_typing");
            socket.off("user_online");
            socket.off("user_offline");
        };
    }, [currentConversationId, currentUserId, socket, receiverId, onLastMessageUpdate]);

    // Memoize grouped messages
    const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages])

    // Show loading state if the current user is not yet available or receiverId is not set
    if (!currentUserId || !receiverId || !user) {
        return <div className="flex items-center justify-center">Loading...</div>;
    }

    const borderClass = user?.gender === "Male"
        ? "border-2 border-[#203449]"
        : "border-2 border-[#E01D42]";

    return (
        <div className={`flex flex-col h-screen w-full md:border-0 ${borderClass} bg-repeat bg-center`}
            style={{
                backgroundImage: user?.gender === "Male"
                    ? "url('/wallpaper_man.svg')"
                    : "url('/wallpaper_woman.svg')"
            }}>

            <div className={`p-[0.65rem] text-xl font-bold ${borderClass} ${user?.gender === "Male" ? "bg-[#203449]" : "bg-[#FFF1FE]"} bg-opacity-60 text-black inline-flex items-center space-x-4`}>
                <div className={`md:hidden cursor-pointer ${user?.gender === "Male" ? "text-white" : "text-black"}`} onClick={() => navigate("/matches")}>
                    <ChevronLeft className="w-10-h-10" />
                </div>
                <div className={`rounded-full bg-white overflow-hidden w-16 h-16`} >
                    <img src={`${user?.gender === "Male" ? "/icon_woman.svg" : "/icon_man.svg"}`} alt={`${user?.gender === "Male" ? "icon_woman" : "icon_man"}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col items-start">
                    <span className={`text-lg font-semibold ${user?.gender === "Male" ? "text-white" : "text-black"}`}>
                        {currentUserId ? `${receiverName[1]} ${receiverName[2]}` : "Loading..."}
                    </span>
                    {!isOnline && lastSeen && (
                        <span className={`text-sm ${user?.gender === "Male" ? "text-white" : "text-black"}`}>{formattedLastSeen}</span>
                    )}
                </div>
                {/* Status Dot (Green or Grey) */}
                <div className="ml-2">
                    {isOnline === true ? ( // If online, show GREEN dot
                        <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                    ) : isOnline === false && lastSeen === null ? ( // If offline & lastSeen is NULL, show GREY dot
                        <span className="w-3 h-3 rounded-full bg-gray-400 inline-block"></span>
                    ) : null /* If offline & lastSeen exists, show nothing */}
                </div>
            </div>
            <div className="flex-1 p-10 md:ml-10 overflow-y-auto">
                {groupedMessages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-gray-400 text-center">Why not introduce yourself?</p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs], dateIndex) => (
                        <div key={dateIndex}>

                            {/* Date Header */}
                            <div className="flex justify-center m-8">
                                <div className={`text-white ${user?.gender === "Male" ? "bg-[#203449]" : "bg-[#E01D42]"} bg-opacity-40 font-semibold px-4 py-2 rounded-lg`}>
                                    {date}
                                </div>
                            </div>

                            {/* Loop through each message in the array */}
                            {msgs.map((msg, index) => (
                                <div key={index} className={`flex w-full ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"} mb-4`}>
                                    {/* Sender Information */}
                                    <div className={`flex items-end ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"} mb-2`}>
                                    </div>

                                    {/* Message Bubble */}
                                    <div
                                        className={`max-w-xs md:max-w-md p-4 rounded-full shadow-md break-words text-white
                                                ${msg.sender_id === currentUserId
                                                ? user?.gender === "Male"
                                                    ? "bg-[#203449] rounded-br-none"  // Male user's sent messages (dark blue)
                                                    : "bg-[#E01D42] rounded-br-none"  // Female user's sent messages (red)
                                                : user?.gender === "Male"
                                                    ? "bg-[#E01D42] rounded-bl-none"   // If male, receiver's messages are red
                                                    : "bg-[#203449] rounded-bl-none"   // If female, receiver's messages are dark blue
                                            }`}
                                    >
                                        <p className="font-semibold">{msg.text}</p>
                                    </div>

                                    {/* Timestamp and Message Status */}
                                    <div className="ml-2 text-sm text-gray-600">
                                        <span>
                                            {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        {index === msgs.length - 1 && msg.sender_id === currentUserId && (
                                            <p className="text-xs text-[#203449]">{msg.status}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
                {isTyping && (
                    <TypingIndicator isTyping={true} gender={user?.gender} />
                )}
            </div>
            {/* Smooth scrolling to the latest message */}
            <div ref={messagesEndRef}></div>

            <div className="md:p-10 flex items-center m-6">
                <input
                    type="text"
                    name="chatbox"
                    id="chatbox"
                    className={`flex-1 p-4 bg-[#fef2f2] text-black rounded-lg focus:outline-none ${borderClass} hover:bg-white transition-all duration-300`}
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage}
                    className={`ml-2 mr-2 p-2 rounded-lg ${user.gender === "Male" ? "text-[#203449] hover:text-blue-300" : "text-[#E01D42] hover:text-red-300"}`}>
                    <Send className="w-10 h-10" />
                </button>
            </div>
        </div>
    );
}
