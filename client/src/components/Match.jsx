import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from "lucide-react";
import axios from 'axios';
import ClippedIcon from './ClippedIcons';
import { useAuth } from './contexts/AuthContext';

const Match = () => {
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth()

  useEffect(() => {
    fetchMatches();
    fetchConversations();
  }, []);

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
      console.log(response.data);
    } catch (error) {
      console.error('Error creating new conversation', error);
    }
  };

  const getConversationWithMatch = (match) => {
    return conversations.find((conversation) =>
      conversation.participants.some((p) => p._id === match._id)
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col border-t-4 border-[#203449] p-4 md:p-8">
      <h1 className="text-3xl font-bold text-left mb-4">Matches</h1>

      {/* Toggle Button for Mobile */}
      <button className="md:hidden p-2 bg-[#203449] text-white rounded mb-4" onClick={() => setIsMobileOpen(!isMobileOpen)}>
        {isMobileOpen ? 'Close Matches' : 'Open Matches'}
      </button>

      <div className="flex flex-col md:flex-row border-4 border-[#203449] rounded-lg shadow-md">
        {/* Matches List */}
        <div className={`${isMobileOpen ? 'block' : 'hidden'} md:block w-full md:w-1/3 bg-[#FFF1FE] p-4 border-r-4 border-[#203449]`}>
          {matches.length > 0 ? (
            matches.map((match, index) => {
              const opponent = match.sender._id !== user.userId ? match.sender : match.receiver;
              return (
                <div
                  key={index}
                  className={`p-4 mb-2 cursor-pointer rounded-lg border-4 border-[#E01D42] ${selectedMatch?._id === opponent._id ? "bg-[#FFF1FE] text-black" : "bg-white"} hover:bg-[#FFF1FE] transition-all duration-300`}
                  onClick={() => {
                    setSelectedMatch(opponent);
                    setIsMobileOpen(false);
                  }}
                >
                  <User className="w-8 h-8 text-black" />
                  <div>
                    <h3 className="font-semibold">{opponent.firstName} {opponent.lastName}</h3>
                    <p className="text-sm text-gray-500">{opponent.userName}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500">No matches found.</p>
          )}
        </div>

        {/* Conversation Panel */}
        <div className="w-full md:w-2/3 bg-white p-4">
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
                    onClick={() => navigate(`/chat/${conversation._id}/${user.userId}`)}
                  >
                    <div className='flex justify-start items-center'>
                      <p className='text-sm text-black'>{conversation.last_sender_id === user.userId ? "You" : selectedMatch.firstName}: </p>
                      <p className="ml-2 text-sm text-black">{conversation.last_message}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <h2 className="text-xl font-semibold mb-4">No conversation yet with {selectedMatch.firstName}</h2>
                  <button onClick={handleNewConversation}>
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
