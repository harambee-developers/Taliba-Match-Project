import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/contexts/AuthContext';
import { format, isToday } from 'date-fns';
import ChatApp from '../components/ChatApp';
import { useChatEvents } from '../components/contexts/ChatEventsContext';
import { getCachedData, cacheData } from '../utils/cacheUtil';

const Match = () => {
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const { isTyping } = useChatEvents()
  const { user } = useAuth()
  const navigate = useNavigate();

  const chatCache = "chat-cache";
  const CACHE_MATCHES = `chat_matches`;
  const CACHE_CONVERSATION = 'chat_conversations';

  useEffect(() => {
    if (user) {
      fetchMatches();
      fetchConversations();
    }
  }, [user])

  const fetchMatches = useCallback(async () => {
    const cached = await getCachedData(CACHE_MATCHES, chatCache);
    if (cached) {
      setMatches(cached)
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/match/matches/${user.userId}`);
      setMatches(response.data);
      // ✅ Cache it
      await cacheData(CACHE_MATCHES, response.data, chatCache);
    } catch (error) {
      console.error('Error fetching matches: ', error);
    }
  });

  const fetchConversations = useCallback(async () => {
    const cached = await getCachedData(CACHE_CONVERSATION, chatCache);
    if (cached) {
      setConversations(cached)
      return;
    }
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/message/user/${user.userId}`);
      const conversationData = response.data; // This is your array of conversations.
      setConversations(conversationData);
      await cacheData(CACHE_CONVERSATION, conversationData, chatCache);
    } catch (error) {
      console.error('Error fetching conversations: ', error);
    }
  });

  const handleNewConversation = async (selectedMatchId) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/message/new-conversation`, { user1: selectedMatchId, user2: user.userId });
      const newConversation = response.data; // Get the newly created conversation
      // Update the conversations state to include the new conversation,
      // and update the cache accordingly.
      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations, newConversation];
        cacheData(CACHE_CONVERSATION, updatedConversations, chatCache);
        return updatedConversations;
      });
      console.log("New conversation created:", newConversation);
      return newConversation;
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

  const getUnreadCount = (conversation) => {
    // If the last message wasn't sent by the current user, mark it as unread
    return conversation.last_sender_id !== user.userId ? 1 : 0;
  };

  const chatComponent = useMemo(() => {
    if (!selectedMatch || !user?.userId)
      return <div className='flex text-center justify-center h-screen text-gray-500'>
        <p>Select a match to view the conversation.</p>;
      </div>

    const conversation = getConversationWithMatch(selectedMatch);
    // If conversation is still null, display a placeholder (or a loading spinner)
    if (!conversation) {
      return (
        <div className='flex text-center justify-center min-h-screen text-gray-500'>
          <p>Creating a new conversation...</p>
        </div>
      );
    }

    return <ChatApp conversation={conversation._id} user_id={user.userId} onLastMessageUpdate={handleLastMessageUpdate} />;
  }, [selectedMatch, conversations, user?.userId, handleLastMessageUpdate, getConversationWithMatch]);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <div className={`flex flex-col md:flex-row ${borderClass} items-stretch rounded-lg shadow-md`}>
        <div className={`w-full md:w-1/3 ${borderClass} min-h-screen`}>
          {/* Full-width Title with Border */}
          <h1 className={`${user?.gender === "Male" ? "bg-[#203449] text-white" : "bg-[#FFF1FE] text-black"} bg-opacity-60 text-3xl font-bold text-left pt-[1.5rem] pb-[1.45rem] px-4 ${borderClass}`}>
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
                    onClick={async () => {
                      if (!conversation) {
                        setIsCreatingConversation(true);
                        const newConv = await handleNewConversation(opponent._id);

                        if (newConv) {
                          await fetchConversations(); // Make sure state updates with the new conversation
                          setSelectedMatch(opponent);
                        }

                        setIsCreatingConversation(false);
                        return;
                      }
                      if (window.innerWidth < 768) {
                        // On mobile, navigate directly to chat using the existing conversation.
                        navigate(`/chat/${conversation._id}`);
                      } else {
                        // On desktop, select the match.
                        setSelectedMatch(opponent);
                      }
                    }
                    }
                  >
                    {/* User Icon */}
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300 mr-4">
                      <img
                        src={`${user?.gender === "Male" ? "/icon_woman.svg" : "/icon_man.svg"}`}
                        alt={`${user?.gender === "Male" ? "icon_woman" : "icon_man"}`}
                        className="w-full h-full object-cover"
                        loading='lazy'
                      />
                    </div>

                    {/* User Details */}
                    <div className="flex-1 flex flex-col justify-center">
                      {/* Top row: Name and Time */}
                      <div className="flex justify-between items-center w-full mb-1">
                        <h3 className="font-semibold text-base truncate">
                          {opponent.firstName} {opponent.lastName}
                        </h3>

                        {/* Time + Unread Badge */}
                        <div className="flex flex-col items-end min-w-[48px] ml-2">
                          {lastMessageTime && (
                            <p className="text-xs text-gray-500 whitespace-nowrap">{lastMessageTime}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 truncate flex justify-between items-center w-full">
                        <span className="truncate">
                          {conversation?._id === isTyping.conversationId && isTyping.isTyping ? (
                            <span className="text-gray-500 font-semibold">
                              {opponent.firstName} is typing...
                            </span>
                          ) : conversation ? (
                            <>
                              <span className="font-semibold">
                                {conversation.last_sender_id === user?.userId ? "You" : opponent.firstName}:
                              </span> {conversation.last_message}
                            </>
                          ) : (
                            "No messages yet"
                          )}
                        </span>

                        {/* Push badge to the right */}
                        {conversation && getUnreadCount(conversation) > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-[1px] rounded-full shrink-0">
                            {getUnreadCount(conversation)}
                          </span>
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
