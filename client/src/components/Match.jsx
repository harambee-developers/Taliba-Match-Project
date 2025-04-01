import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from "lucide-react";
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import { format, isToday } from 'date-fns';
import ChatApp from './ChatApp';

const Match = () => {
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchMatches();
      fetchConversations();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/match/matches/${user.userId}`);
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches: ', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/message/user/${user.userId}`);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations: ', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/message/new`, { user1: selectedMatch._id, user2: user.userId });
      const newConversation = response.data; // Get the newly created conversation
      // Update the conversations state to include the new conversation
      setConversations((prevConversations) => [...prevConversations, newConversation]);
      console.log("New conversation created:", newConversation);
    } catch (error) {
      console.error('Error creating new conversation', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    return isToday(new Date(timestamp))
      ? format(new Date(timestamp), 'HH:mm')
      : format(new Date(timestamp), 'dd/MM/yyyy');
  };

  // This function will be called by ChatApp to update the last message.
  const handleLastMessageUpdate = (conversationId, newLastMessage, senderId) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv._id === conversationId
          ? {
            ...conv,
            last_message: newLastMessage,
            last_sender_id: senderId, // ✅ Update sender ID
            updatedAt: new Date().toISOString()
          }
          : conv
      )
    );
  };

  const getConversationWithMatch = useCallback((match) => {
    if (!conversations || conversations.length === 0) return null; // ✅ Prevent undefined

    return conversations.find((conversation) =>
      conversation?.participants?.some((p) => p._id === match._id) // ✅ Optional chaining
    ) || null; // ✅ Return `null` if no conversation is found
  }, [conversations]);

  const borderClass = user?.gender === "Male"
    ? "border-2 border-[#203449]"
    : "border-2 border-[#E01D42]";

  const chatComponent = useMemo(() => {
    if (!selectedMatch || !user?.userId) return <p className="text-center text-gray-500">Select a match to view the conversation.</p>;
    const conversation = getConversationWithMatch(selectedMatch);
    return <ChatApp conversation={conversation?._id} user_id={user.userId} onLastMessageUpdate={handleLastMessageUpdate} />;
  }, [selectedMatch, conversations, user?.userId, handleLastMessageUpdate, getConversationWithMatch]);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <div className={`flex flex-col md:flex-row ${borderClass} items-stretch rounded-lg shadow-md`}>
        <div className={`w-full md:w-1/3 ${borderClass} min-h-screen`}>
          {/* Full-width Title with Border */}
          <h1 className={`${user?.gender === "Male" ? "bg-[#203449]" : "bg-[#FFF1FE]"} bg-opacity-60 text-3xl font-bold text-left pt-[1.5rem] pb-[1.45rem] px-4 ${borderClass}`}>
            Matched
          </h1>
          <div className='p-4'>
            {matches.length > 0 ? (
              matches.map((match, index) => {
                const opponent = match.sender._id !== user?.userId ? match.sender : match.receiver;
                const conversation = getConversationWithMatch(opponent);
                const lastMessageTime = conversation ? formatTimestamp(conversation.updatedAt) : null;

                return (
                  <div
                    key={index}
                    className={`flex items-center p-4 mb-2 cursor-pointer rounded-lg ${borderClass} bg-white hover:bg-[#FFF1FE] transition-all duration-300`}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        // On mobile, navigate directly to chat
                        if (conversation) {
                          navigate(`/chat/${conversation._id}`);
                        } else {
                          handleNewConversation(opponent);
                        }
                      } else {
                        // On desktop, use the selected match approach
                        setSelectedMatch(opponent);
                      }
                    }}
                  >
                    {/* User Icon */}
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300 mr-4">
                      <img
                        src={`${user?.gender === "Male" ? "/icon_woman.svg" : "/icon_man.svg"}`} 
                        alt={`${user?.gender === "Male" ? "icon_woman" : "icon_man"}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* User Details */}
                    <div className="flex-1">
                      <div className='flex justify-between items-center w-full'>
                        <h3 className="font-semibold">{opponent.firstName} {opponent.lastName}</h3>
                        {/* Timestamp - Aligned to the right */}
                        {lastMessageTime && (
                          <p className="text-sm text-gray-500 ml-auto">
                            {lastMessageTime}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {conversation ? (
                          <>
                            <span className="font-semibold">
                              {conversation.last_sender_id === user?.userId ? "You" : opponent.firstName}:
                            </span> {conversation.last_message}
                          </>
                        ) : (
                          "No messages yet"
                        )}
                      </p>
                    </div>

                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">No matches found.</p>
            )}
          </div>
        </div>
        {/* Conversation Panel - Only Shows on Desktop */}
        <div className="hidden md:block w-2/3">
          {chatComponent}
        </div>
      </div>
    </div>
  );
};

export default Match;
