import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Send, ChevronLeft } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useAuth } from "./contexts/AuthContext";
import { useSocket } from "./contexts/SocketContext";
import { useChatEvents } from "./contexts/ChatEventsContext";
import { getCachedData, cacheData } from "../utils/cacheUtil";
import axios from "axios";
import TypingIndicator from "./TypingIndicator";
import MessageModal from "./modals/MessageModal";
import MessageBubble from "./MessageBubble";
import InitialChatModal from "./modals/InitialChatModal";
import UploadGuidelinesModal from "./modals/UploadGuidelinesModal";

export default function ChatApp({ conversation, user_id, onLastMessageUpdate, photoUrl: propPhotoUrl }) {
  const [input, setInput] = useState("");
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const navigate = useNavigate()
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef();
  const dropdownRef = useRef(null);

  // Get user from AuthContext, socket from SocketContext and chat events context
  const { user } = useAuth();
  const { socket } = useSocket();
  const { isTyping } = useChatEvents()

  const [receiverId, setReceiverId] = useState(null)
  const [receiverName, setReceiverName] = useState(null)
  const [messages, setMessages] = useState([]);
  const [localReceiverStatus, setLocalReceiverStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Use URL params as a fallback if props are null
  const { conversationId: conversationIdFromParams } = useParams();
  const currentConversationId = conversation || conversationIdFromParams;
  const currentUserId = user_id || user?.userId;

  const { state } = useLocation();
  const locationPhotoUrl = state?.photoUrl;

  const chatCache = "chat-cache";
  const CACHE_MESSAGES = `chat_messages_${currentConversationId}`;
  const CACHE_DETAILS = `chat_details_${currentConversationId}`;
  const CACHE_STATUS = `chat_status_${currentConversationId}`
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit

  const raw =
    propPhotoUrl ||
    locationPhotoUrl ||
    (user?.gender === 'Male'
      ? 'icon_woman6.png'
      : 'icon_man5.png');

  const backend = import.meta.env.VITE_BACKEND_URL;

  // If it already starts with the backend URL or “/”, leave it as-is.
  // Otherwise, if it’s a bare filename, prepend a slash.
  // (You could also choose to prepend the backend URL here instead of “/” if appropriate.)
  let photoUrl;
  if (raw.startsWith(backend)) {
    photoUrl = raw;
  } else if (raw.startsWith('/')) {
    photoUrl = raw;
  } else {
    photoUrl = '/' + raw;
  }

  // Dropdown for when picture profile is selected
  const toggleDropdown = () => setShowDropdown(prev => !prev);

    // Close dropdown on outside click
    useEffect(() => {
      const handler = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setShowDropdown(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

  // Fetch and set receiver details
  useEffect(() => {
    const fetchReceiverDetails = async () => {
      const cached = await getCachedData(CACHE_DETAILS, chatCache);
      if (cached) {
        setReceiverId(cached._id);
        setReceiverName([cached.userName, cached.firstName, cached.lastName]);
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

  const handleAttachmentClick = (e) => {
    e.preventDefault();
    setShowUploadModal(true);
  };

  const handleUploadProceed = () => {
    // Close the modal
    setShowUploadModal(false);
    // Directly trigger a click on the hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf,.doc,.docx,.txt';
    fileInput.onchange = handleFileSelect;
    fileInput.click();
  };

  const handleUploadCancel = () => {
    setShowUploadModal(false);
  };

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
      // Clear file input so it doesn't trigger again with the same file.
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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


    const notificationObject = {
      text: `${user.firstName} sent you a message!`,
      conversationId: currentConversationId,
      receiver_id: receiverId,
      sender_id: currentUserId,
    }

    console.info("Sending message: ", messageData);

    socket.emit("send_message", messageData);
    socket.emit("stop_typing", { conversationId: currentConversationId, senderId: currentUserId });
    socket.emit("notification", notificationObject)

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
      // Only play the notification sound if the message is not from the current user.
      if (message.sender_id !== currentUserId) {
        const pingSound = new Audio("/sounds/ping.mp3");
        // Play sound; if already playing, restart it.
        if (pingSound.paused) {
          pingSound.play();
        } else {
          pingSound.currentTime = 0;
          pingSound.play();
        }
      }
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

  // Add this useEffect after the other useEffects
  useEffect(() => {
    const checkModalStatus = async () => {
      if (!currentConversationId || !currentUserId) return;

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/message/${currentConversationId}/modal-status`
        );

        if (!data.initial_modal_shown.includes(currentUserId)) {
          setShowInitialModal(true);
        }
      } catch (err) {
        console.error("Error checking modal status:", err);
      }
    };

    checkModalStatus();
  }, [currentConversationId, currentUserId]);

  const handleNaseehaClose = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/message/${currentConversationId}/mark-modal-shown`,
        { userId: currentUserId }
      );
      setShowInitialModal(false);
    } catch (err) {
      console.error("Error marking modal as shown:", err);
    }
  };

  // Show loading state if the current user is not yet available or receiverId is not set
  if (!currentUserId || !receiverId || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div
      className="flex flex-col h-screen w-full bg-center bg-repeat bg-[length:100%] md:bg-[length:60%]"
      style={{
        backgroundImage:
          user?.gender === "Male"
            ? "url('/wallpaper_man.svg')"
            : "url('/wallpaper_woman.svg')",
      }}
      loading="lazy"
    >
      <InitialChatModal
        isOpen={showInitialModal}
        onClose={handleNaseehaClose}
      />
      <UploadGuidelinesModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onProceed={handleUploadProceed}
      />
      {/* Header */}
      <div
        className="p-[0.65rem] text-xl font-bold theme-border theme-bg text-black inline-flex items-center z-40 space-x-4 fixed top-0 left-0 right-0 sm:static"
      >
        <div
          className="md:hidden cursor-pointer theme-bg"
          onClick={() => navigate("/matches")}
        >
          <ChevronLeft className="w-10-h-10" />
        </div>
        <div className="relative" ref={dropdownRef}>
          <div
            className="rounded-full bg-white theme-border overflow-hidden w-16 h-16 cursor-pointer"
            onClick={toggleDropdown}
          >
            <img
              src={photoUrl}
              alt="User Icon"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {showDropdown && (
            <div className="absolute z-50 mt-2 w-48 right-0 bg-white border rounded-lg shadow-md text-sm">
              <div className="flex items-center px-4 py-2 space-x-2">
                <img
                  src={photoUrl}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-semibold">{`${receiverName[1]} ${receiverName[2]}`}</span>
                  <span className={`text-xs ${localReceiverStatus?.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                    {localReceiverStatus?.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              <button
                onClick={async () => {
                  await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/block/${receiverId}`);
                  alert("User has been blocked");
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Block User
              </button>
              <button
                onClick={async () => {
                  const reason = window.prompt("Why are you reporting this user?");
                  if (!reason) return;
                  await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/report/${receiverId}`, { reason });
                  alert("Thank you. The user has been reported.");
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
              >
                Report User
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-lg font-semibold theme-bg">
            {currentUserId
              ? `${receiverName[1]} ${receiverName[2]}`
              : "Loading..."}
          </span>
          {localReceiverStatus &&
            !localReceiverStatus.isOnline &&
            localReceiverStatus.lastSeen && (
              <span className="text-sm theme-bg">
                {formattedLastSeen}
              </span>
            )}
        </div>
        <div className="ml-2">
          {localReceiverStatus?.isOnline === true ? (
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          ) : localReceiverStatus?.isOnline === false &&
            localReceiverStatus?.lastSeen === null ? (
            <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
          ) : null}
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 pt-[4rem] p-10 md:ml-10 overflow-y-auto">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400 text-center">
              Why not introduce yourself?
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs], dateIndex) => (
            <div key={dateIndex}>
              {/* Date Header */}
              <div className="flex justify-center m-8">
                <div
                  className={`text-white ${user?.gender === "Male"
                      ? "bg-[#203449]"
                      : "bg-[#E01D42]"
                    } bg-opacity-40 font-semibold px-4 py-2 rounded-lg text-sm`}
                >
                  {date}
                </div>
              </div>

              {/* Loop through each message */}
              {msgs.map((msg, index) => {
                const isMine = msg.sender_id === currentUserId;
                const prev = msgs[index - 1];
                const isFirstInRun =
                  !prev || prev.sender_id !== msg.sender_id;

                return (
                  <div
                    key={msg.id ?? index}
                    className={`flex w-full ${isMine ? "justify-end" : "justify-start"
                      } items-end mb-2`}
                  >
                    {/* Bubble */}
                    <MessageBubble
                      msg={msg}
                      isMine={isMine}
                      isFirstInRun={isFirstInRun}
                      gender={user?.gender}
                    />

                    {/* Timestamp & status */}
                    <div className="ml-2 text-sm text-gray-600">
                      {index === msgs.length - 1 &&
                        isMine && (
                          <p className="text-xs text-[#203449]">
                            {msg.status}
                          </p>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        {isTyping.isTyping && (
          <TypingIndicator
            isTyping
            gender={user?.gender}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="md:p-10 flex items-center space-x-2 p-2">
        {/* File Attachment */}
        <div
          htmlFor="file-attachment"
          className="cursor-pointer mr-2 group"
          onClick={handleAttachmentClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 ${user.gender === "Male"
                ? "text-[#203449] group-hover:text-blue-400"
                : "text-[#E01D42] group-hover:text-red-300"
              }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </div>
        {/* Text input */}
        <input
          type="text"
          name="chatbox"
          id="chatbox"
          disabled={isUploading}
          className="flex-1 p-3 md:p-4 bg-[#fef2f2] text-black rounded-lg focus:outline-none theme-border hover:bg-white transition-all duration-300"
          placeholder={
            isUploading
              ? "Uploading..."
              : "Type a message..."
          }
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) =>
            e.key === "Enter" && sendMessage()
          }
        />

        {/* Send button */}
        <button
          onClick={sendMessage}
          disabled={isUploading}
          className={`flex-shrink-0 w-10 h-10 rounded-lg ${user.gender === "Male"
              ? "text-[#203449] hover:text-blue-400"
              : "text-[#E01D42] hover:text-red-300"
            }`}
        >
          <Send className="w-full h-full" />
        </button>
      </div>
    </div>
  );
}
