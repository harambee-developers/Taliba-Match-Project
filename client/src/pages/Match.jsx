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

  const { isTyping } = useChatEvents();
  const { user } = useAuth();
  const navigate = useNavigate();

  const chatCache = 'chat-cache';
  const CACHE_MATCHES = 'chat_matches';
  const CACHE_CONVERSATION = 'chat_conversations';

  useEffect(() => {
    if (user) {
      fetchMatches();
      fetchConversations();
    }
  }, [user]);

  const fetchMatches = useCallback(async () => {
    const cached = await getCachedData(CACHE_MATCHES, chatCache);
    if (cached) setMatches(cached);

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/match/matches/${user.userId}`
      );
      setMatches(data);
      await cacheData(CACHE_MATCHES, data, chatCache);
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
  }, [user]);

  const fetchConversations = useCallback(async () => {
    const cached = await getCachedData(CACHE_CONVERSATION, chatCache);
    if (cached) setConversations(cached);

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/message/user/${user.userId}`
      );
      setConversations(data);
      await cacheData(CACHE_CONVERSATION, data, chatCache);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  }, [user]);

  const handleLastMessageUpdate = (convId, msg, sender) => {
    setConversations(prev =>
      prev.map(conv =>
        conv._id === convId
          ? { ...conv, last_message: msg, last_sender_id: sender, updatedAt: new Date().toISOString() }
          : conv
      )
    );
  };

  const getConversationWithMatch = useCallback(
    match =>
      conversations.find(conv =>
        conv?.participants?.some(p => p?._id === match?._id)
      ) || null,
    [conversations]
  );

  const formatTimestamp = ts => {
    if (!ts) return '';
    return isToday(new Date(ts))
      ? format(new Date(ts), 'HH:mm')
      : format(new Date(ts), 'dd/MM/yyyy');
  };

  const chatComponent = useMemo(() => {
    if (!selectedMatch) return (
      <div className="flex text-center justify-center h-screen text-gray-500">
        <p>Select a match to view the conversation.</p>
      </div>
    );

    const conversation = getConversationWithMatch(selectedMatch);
    const photoUrl = selectedMatch.photos?.[0]?.url ||
      (user.gender === 'Male' ? '/icon_woman6.png' : '/icon_man5.png');

    if (!conversation) {
      return (
        <div className="flex text-center justify-center min-h-screen text-gray-500">
          <p>Creating a new conversation...</p>
        </div>
      );
    }

    return (
      <ChatApp
        conversation={conversation._id}
        user_id={user.userId}
        onLastMessageUpdate={handleLastMessageUpdate}
        photoUrl={photoUrl}
      />
    );
  }, [selectedMatch, conversations, user]);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <div className="flex flex-col md:flex-row theme-border items-stretch rounded-lg shadow-md">
        <div className="w-full md:w-1/3 theme-border min-h-screen">
          <h1 className="theme-bg bg-opacity-60 text-3xl font-bold p-4 theme-border">
            Marriage Meeting
          </h1>
          <div className="p-4">
            {matches.length ? (
              matches.map((match, idx) => {
                const opponent = match.sender._id !== user.userId ? match.sender : match.receiver;
                const conversation = getConversationWithMatch(opponent);
                const lastTime = conversation ? formatTimestamp(conversation.updatedAt) : '';
                const fallback = user.gender === 'Male' ? '/icon_woman6.png' : '/icon_man5.png';
                const photo = opponent.photos?.[0]?.url || fallback;

                return (
                  <div
                    key={idx}
                    className="flex items-center p-4 mb-2 cursor-pointer rounded-lg theme-border bg-white hover:bg-[#FFF1FE] transition duration-300"
                    onClick={async () => {
                      if (!conversation) {
                        const newConv = await axios.post(
                          `${import.meta.env.VITE_BACKEND_URL}/api/message/new-conversation`,
                          { user1: opponent._id, user2: user.userId }
                        );
                        setSelectedMatch(opponent);
                        await fetchConversations();
                        return;
                      }
                      if (window.innerWidth < 768) {
                        navigate(`/chat/${conversation._id}`, { state: { photoUrl: photo } });
                      } else {
                        setSelectedMatch(opponent);
                      }
                    }}
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden border mr-4">
                      <img src={photo} alt="avatar" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-semibold truncate">
                          {opponent.firstName} {opponent.lastName}
                        </h3>
                        <p className="text-xs text-gray-500">{lastTime}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 truncate">
                          {conversation?.last_sender_id === user.userId ? 'You:' : opponent.firstName + ':'}{' '}
                          {conversation?.last_message || 'No messages yet'}
                        </p>
                        {conversation && conversation.last_sender_id !== user.userId && (
                          <span className="ml-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                            1
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">No matches found.</p>
            )}
          </div>
        </div>
        <div className="hidden md:block w-2/3">{chatComponent}</div>
      </div>
    </div>
  );
};

export default Match;
