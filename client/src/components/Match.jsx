import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from "lucide-react";
import axios from 'axios';
import ClippedIcon from './ClippedIcons';
import { useAuth } from './contexts/AuthContext';
import { format, isToday } from 'date-fns';

const Match = () => {
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [] = useState(null)
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
      : format(new Date(timestamp), 'dd/MMM/yyyy');
  };

  const getConversationWithMatch = (match) => {
    if (!conversations || conversations.length === 0) return null; // ✅ Prevent undefined

    return conversations.find((conversation) =>
      conversation?.participants?.some((p) => p._id === match._id) // ✅ Optional chaining
    ) || null; // ✅ Return `null` if no conversation is found
  };

  return (
    <div className="min-h-screen bg-white flex flex-col border-t-4 border-[#203449] p-4 md:p-8">
      <h1 className="text-3xl font-bold text-left mb-4">Matched</h1>

      <div className="flex flex-col md:flex-row border-4 border-[#203449] rounded-lg shadow-md">
        {/* Matches List - Always Visible */}
        <div className="w-full md:w-1/3 bg-[#FFF1FE] p-4 border-r-4 border-[#203449] min-h-screen">
          {matches.length > 0 ? (
            matches.map((match, index) => {
              const opponent = match.sender._id !== user.userId ? match.sender : match.receiver;
              const conversation = getConversationWithMatch(opponent);
              const lastMessageTime = conversation ? formatTimestamp(conversation.updatedAt) : null;

              return (
                <div
                  key={index}
                  className="flex items-center p-4 mb-2 cursor-pointer rounded-lg border-4 border-[#E01D42] bg-white hover:bg-[#FFF1FE] transition-all duration-300"
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
                  <User className="w-10 h-10 text-black mr-4" />

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
                            {conversation.last_sender_id === user.userId ? "You" : opponent.firstName}:
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

        {/* Conversation Panel - Only Shows on Desktop */}
        <div className="hidden md:block w-2/3 bg-white p-4">
          {selectedMatch ? (
            (() => {
              const conversation = getConversationWithMatch(selectedMatch);
              return conversation ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Message with {selectedMatch.firstName} {selectedMatch.lastName}
                  </h2>
                  <div
                    className="p-4 bg-white rounded-lg shadow-sm border-4 border-[#203449] hover:bg-[#fef2f2] hover:scale-105 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/chat/${conversation._id}`)}
                  >
                    <div className='flex justify-start items-center'>
                      <p className='text-sm text-black'>{conversation.last_sender_id === user.userId ? "You" : selectedMatch.firstName}: </p>
                      <p className="ml-2 text-sm text-black">{conversation.last_message}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <h2 className="text-xl font-semibold mb-4">No chat with {selectedMatch.firstName}. Click here to give salam first</h2>
                  <button onClick={() => handleNewConversation(selectedMatch)}>
                    <ClippedIcon />
                  </button>
                </div>
              );
            })()
          ) : (
            <p className="text-center text-gray-500">Select a match to view the conversation.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Match;
