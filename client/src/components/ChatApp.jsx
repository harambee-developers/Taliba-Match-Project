import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send, ChevronLeft } from "lucide-react";
import { format, isToday, isYesterday, previousMonday } from "date-fns";
import { useAuth } from "./contexts/AuthContext";
import { useSocket } from "./contexts/SocketContext";
import { useChatEvents } from "./contexts/ChatEventsContext";
import { getCachedData, cacheData } from "../utils/cacheUtil";
import axios from "axios";
import TypingIndicator from "./TypingIndicator";

export default function ChatApp({ conversation, user_id, onLastMessageUpdate }) {
    const [input, setInput] = useState("");

    const navigate = useNavigate()
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Get user from AuthContext, socket from SocketContext and chat events context
    const { user } = useAuth();
    const { socket } = useSocket();
    const { isTyping } = useChatEvents()

    const [receiverId, setReceiverId] = useState(null)
    const [receiverName, setReceiverName] = useState(null)
    const [messages, setMessages] = useState([]);
    const [localReceiverStatus, setLocalReceiverStatus] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Use URL params as a fallback if props are null
    const { conversationId: conversationIdFromParams } = useParams();
    const currentConversationId = conversation || conversationIdFromParams;
    const currentUserId = user_id || user?.userId;

    const chatCache = "chat-cache";
    const CACHE_MESSAGES = `chat_messages_${currentConversationId}`;
    const CACHE_DETAILS = `chat_details_${currentConversationId}`;
    const CACHE_STATUS = `chat_status_${currentConversationId}`
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit

    // Fetch and set receiver details
    useEffect(() => {
        const fetchReceiverDetails = async () => {
            const cached = await getCachedData(CACHE_DETAILS, chatCache);
            if (cached) {
                setReceiverId(cached._id);
                setReceiverName([cached.userName, cached.firstName, cached.lastName]);
                return;
            }
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/message/${currentConversationId}/details`);
                const receiver = data?.participants?.find(p => p._id !== currentUserId);
                if (receiver) {
                    setReceiverId(receiver._id);
                    setReceiverName([receiver.userName, receiver.firstName, receiver.lastName]);
                    cacheData(CACHE_DETAILS, receiver, chatCache);
                }
            } catch (err) {
                console.error("Error fetching receiver details", err);
            }
        };
        if (currentConversationId && currentUserId) {
            fetchReceiverDetails();
        }
    }, [currentConversationId, currentUserId]);

    useEffect(() => {
        if (!receiverId) return;
        const fetchStatus = async () => {
            const cachedStatus = await getCachedData(CACHE_STATUS, chatCache);
            if (cachedStatus) {
                console.info("✅ Loaded status from cache");
                setLocalReceiverStatus(cachedStatus.data);
                return;
            }
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/message/fetch-status/${receiverId}`)
                cacheData(CACHE_STATUS, response, chatCache)
                setLocalReceiverStatus(response.data);
            } catch (error) {
                console.error("Error fetching messages", error.message);
            }
        }
        fetchStatus();
    }, [receiverId])

    // Fetch messages (once) for display if context hasn't populated yet
    useEffect(() => {
        if (!currentConversationId) return;
        const fetchMessages = async () => {
            const cached = await getCachedData(CACHE_MESSAGES, chatCache);
            if (cached) {
                setMessages(cached)
                return;
            }
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/message/${currentConversationId}/messages`);
                setMessages(data.messages)
                cacheData(CACHE_MESSAGES, data.messages, chatCache);
            } catch (err) {
                console.error("Error fetching messages", err);
            }
        };

        fetchMessages();
    }, [currentConversationId]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            alert("File size exceeds the limit of 5 MB.");
            return;
        }

        setIsUploading(true); // Disable input/button
        // Optionally, preview the file if desired (for images)
        if (file.type.startsWith("image/")) {
            const previewURL = URL.createObjectURL(file);
            // You can set state to show the preview somewhere in your UI if needed
            console.info("Image preview URL: ", previewURL);
        }

        // Prepare the payload using FormData
        const formData = new FormData();

        // Append other necessary info
        formData.append("file", file);
        formData.append("conversationId", currentConversationId);
        formData.append("senderId", currentUserId);
        formData.append("receiverId", receiverId);

        // Upload the file using axios
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/message/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            // You might expect the server to respond with the file URL or a message payload.
            const attachmentMessage = response.data.message;
            // Emit the message event via socket (if needed) or update the UI directly
            socket.emit("send_message", attachmentMessage);
            // Optionally update the cache if you're using it
            cacheData(CACHE_MESSAGES, [...messages, attachmentMessage], chatCache);
            // Clear the text input once the file upload is complete
            setInput("");
        } catch (err) {
            console.error("Error uploading file:", err);
        } finally {
            setIsUploading(false); // Re-enable input/button
        }
    };

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
            messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        }, 100); // Delay slightly to allow rendering
    };

    // Format the last seen text
    const formattedLastSeen = localReceiverStatus?.lastSeen
        ? isToday(new Date(localReceiverStatus?.lastSeen))
            ? `Last seen today at ${new Date(localReceiverStatus?.lastSeen).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            })}`
            : `Last seen ${format(new Date(localReceiverStatus?.lastSeen), "MMM d, yyyy")}`
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
            messagesEndRef.current.scrollIntoView({ behavior: "instant" });
        }
    }, [messages])

    useEffect(() => {
        if (!socket) {
            console.warn("Socket not connected yet.");
            return;
        }
        if (!currentConversationId || !currentUserId) return; // Ensure required data is available
        socket.emit("join_chat", { userId: currentUserId, conversationId: currentConversationId });
        const handleMessagesRead = ({ conversationId: cId, receiverId: rId }) => {
            setMessages(prev =>
                prev.map(msg =>
                    msg.conversation_id === cId && msg.receiver_id === rId
                        ? { ...msg, status: "Read" }
                        : msg
                )
            );
        };
        const handleNewMessages = ({ message }) => {
            if (message.conversation_id !== currentConversationId) return;
            setMessages((prev) => {
                const updatedMessage = [...prev, message]
                cacheData(CACHE_MESSAGES, updatedMessage, chatCache)
                return updatedMessage
            })
            if (onLastMessageUpdate) {
                onLastMessageUpdate(currentConversationId, message.text, currentUserId);
            }
        }

        const handleUserOnline = () => setLocalReceiverStatus({ isOnline: true, lastSeen: null });
        const handleUserOffline = ({ lastSeen }) => setLocalReceiverStatus({ isOnline: false, lastSeen });

        socket.on('messages_read', handleMessagesRead)
        socket.on('message', handleNewMessages)
        socket.on("user_online", handleUserOnline);
        socket.on("user_offline", handleUserOffline);

        return () => {
            socket.off('message', handleNewMessages)
            socket.off('messages_read', handleMessagesRead)
            socket.off("user_online", handleUserOnline);
            socket.off("user_offline", handleUserOffline);
        };
    }, [currentConversationId, currentUserId, socket, onLastMessageUpdate]);

    // Memoize grouped messages
    const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages])

    // Show loading state if the current user is not yet available or receiverId is not set
    if (!currentUserId || !receiverId || !user) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
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
                    <img src={`${user?.gender === "Male" ? "/icon_woman.svg" : "/icon_man.svg"}`} alt={`${user?.gender === "Male" ? "icon_woman" : "icon_man"}`} className="w-full h-full object-cover" loading='lazy' />
                </div>
                <div className="flex flex-col items-start">
                    <span className={`text-lg font-semibold ${user?.gender === "Male" ? "text-white" : "text-black"}`}>
                        {currentUserId ? `${receiverName[1]} ${receiverName[2]}` : "Loading..."}
                    </span>
                    {localReceiverStatus && !localReceiverStatus?.isOnline && localReceiverStatus?.lastSeen && (
                        <span className={`text-sm ${user?.gender === "Male" ? "text-white" : "text-black"}`}>{formattedLastSeen}</span>
                    )}
                </div>
                {/* Status Dot (Green or Grey) */}
                <div className="ml-2">
                    {localReceiverStatus?.isOnline === true ? ( // If online, show GREEN dot
                        <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                    ) : localReceiverStatus?.isOnline === false && localReceiverStatus?.lastSeen === null ? ( // If offline & lastSeen is NULL, show GREY dot
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
                                        className={`max-w-xs md:max-w-md p-4 rounded-lg shadow-md break-words text-white
                                                ${msg.sender_id === currentUserId
                                                ? user?.gender === "Male"
                                                    ? "bg-[#203449] rounded-br-none"  // Male user's sent messages (dark blue)
                                                    : "bg-[#E01D42] rounded-br-none"  // Female user's sent messages (red)
                                                : user?.gender === "Male"
                                                    ? "bg-[#E01D42] rounded-bl-none"   // If male, receiver's messages are red
                                                    : "bg-[#203449] rounded-bl-none"   // If female, receiver's messages are dark blue
                                            }`}
                                    >
                                        {msg.attachment ? (
                                            <div className="max-w-full w-full rounded-lg">
                                                {msg.attachment.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                                    <a href={msg.attachment} target="_blank" rel="noopener noreferrer">
                                                        <img
                                                            src={msg.attachment}
                                                            alt="attachment"
                                                            className="w-full max-h-64 rounded-lg object-contain"
                                                        />
                                                    </a>
                                                ) : msg.attachment.match(/\.(mp4|mov|webm|wmv)$/i) ? (
                                                    <video
                                                        controls
                                                        className="w-full max-h-64 rounded-lg object-contain"
                                                    >
                                                        <source src={msg.attachment} />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                ) : (
                                                    <a
                                                        href={msg.attachment}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-200 underline hover:text-blue-100"
                                                    >
                                                        View attachment
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="font-semibold">{msg.text}</p>
                                        )}
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
                {isTyping.isTyping && (
                    <TypingIndicator isTyping={true} gender={user?.gender} />
                )}
                {/* Smooth scrolling to the latest message */}
                <div ref={messagesEndRef}></div>
            </div>


            <div className="md:p-10 flex items-center m-6">
                {/* File Attachment Input */}
                <label htmlFor="file-attachment" className="cursor-pointer mr-4 group">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-12 h-12"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="12"
                            className={`transition-colors duration-200 ${user.gender === "Male" ? "fill-[#203449] group-hover:fill-blue-400" : "fill-[#E01D42] group-hover:fill-red-300"}`}
                        />
                        <path
                            fill="white"
                            d="M16.5 9.5l-6 6c-.8.8-2 .8-2.8 0-.8-.8-.8-2 0-2.8l6-6c1.2-1.2 3.1-1.2 4.3 0 1.2 1.2 1.2 3.1 0 4.3l-5 5c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l5-5c.6-.6.6-1.6 0-2.3-.6-.6-1.6-.6-2.3 0z"
                        />
                    </svg>
                    <input
                        type="file"
                        id="file-attachment"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </label>

                <input
                    type="text"
                    name="chatbox"
                    id="chatbox"
                    disabled={isUploading}
                    className={`flex-1 p-4 bg-[#fef2f2] text-black rounded-lg focus:outline-none ${borderClass} hover:bg-white transition-all duration-300`}
                    placeholder={isUploading ? "Uploading..." : "Type a message..."}
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage}
                    disabled={isUploading}
                    className={`ml-2 mr-2 p-2 rounded-lg ${user.gender === "Male" ? "text-[#203449] hover:text-blue-400" : "text-[#E01D42] hover:text-red-300"}`}>
                    <Send className="w-10 h-10" />
                </button>
            </div>
        </div>
    );
}
