import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User } from "lucide-react";
import axios from 'axios';

const Match = () => {

  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null); // Track selected match

  const navigate = useNavigate();
  const userId = '67d701e0b422cb32154b0254'; // Hardcoded for now

  // 67d5d9a6a1cca2d96762e4be
  // 67d701e0b422cb32154b0254

  useEffect(() => {
    fetchMatches();
    fetchConversations();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/match/matches/${userId}`);
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches: ', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/message/user/${userId}`);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations: ', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/message/new`, { user1: selectedMatch._id, user2: userId })
      console.log(response.data)
    } catch (error) {
      console.error('Error creating new conversation', error)
    }
  }

  // Function to find a conversation with the selected match
  const getConversationWithMatch = (match) => {
    return conversations.find((conversation) =>
      conversation.participants.some((p) => p._id === match._id)
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col border-t-4 border-[#203449]">
      <div className="w-full max-w-7xl mx-auto p-8 min-h-[50vh]">
        <h1 className="text-3xl font-bold text-left mb-8">Matches</h1>

        {/* Layout: Matches List on the Left | Conversation on the Right */}
        <div className="flex border-4 border-[#203449] rounded-lg shadow-md">

          {/* Left Side: List of Matched Users */}
          <div className="w-1/3 bg-[#FFF1FE] p-6 border-r-4 border-[#203449]">
            {matches.length > 0 ? (
              matches.map((match, index) => {
                const opponent = match.sender._id !== userId ? match.sender : match.receiver;
                return (
                  <div
                    key={index}
                    className={`p-4 mb-2 cursor-pointer rounded-lg border-4 border-[#E01D42] ${selectedMatch?._id === opponent._id ? "bg-[#FFF1FE] text-black" : "bg-white"
                      } hover:bg-[#FFF1FE] transition-all duration-300`}
                    onClick={() => setSelectedMatch(opponent)}
                  >
                    {/* User Icon */}
                    <User className="w-8 h-8 text-black" />

                    {/* User Details */}
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

          {/* Right Side: Conversation Panel */}
          <div className="w-2/3 bg-white p-6">
            {selectedMatch ? (
              (() => {
                const conversation = getConversationWithMatch(selectedMatch);
                return conversation ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Chat with {selectedMatch.firstName} {selectedMatch.lastName}
                    </h2>
                    <div
                      className="p-4 bg-white rounded-lg shadow-sm border-4 border-[#203449] hover:bg-[#fef2f2] hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/chat/${conversation._id}/${userId}`)}
                    >
                      <div className='flex justify-start item-center'>
                        <p className='text-sm text-black'>{conversation.last_sender_id === userId ? "You" : selectedMatch.firstName}: </p>
                        <p className="ml-2 text-sm text-black">{conversation.last_message}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-xl font-semibold mb-4">
                      No conversation yet with {selectedMatch.firstName}
                    </h2>
                    <button
                      onClick={handleNewConversation}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Start a Conversation
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
    </div>
  );
};

export default Match;
