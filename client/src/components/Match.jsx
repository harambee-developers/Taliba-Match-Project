import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Match = () => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate()
  const userId = '678fc05a77cea1f247ec17d0'; // Hardcoded for now
  
  // Fetch conversations when the component mounts
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/message/user/${userId}`
      );
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations: ', error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center border-t-4 border-[#203449]">
      {/* Title aligned to the left inside the centered container */}
      <div className="w-full max-w-4xl p-8">
        <h1 className="text-3xl font-bold text-left mb-8">Matched</h1>

        {/* Centered Container */}
        <div className="p-8 bg-[#FFF1FE] rounded-lg shadow-md border-[#203449] border-4">
          {/* Check if there are any conversations */}
          <h2 className="text-2xl font-semibold mb-4">Conversations</h2>
          {conversations.length > 0 ? (
            <div>
              {conversations.map((conversation, index) => (
                <div
                  key={index}
                  className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:space-x-4"
                >
                  {/* Left Container: Username */}
                  <div className="p-4 bg-white rounded-lg shadow-sm border-4 border-[#E01D42] w-full sm:w-1/3">
                    <h3 className="font-semibold">{conversation.participants[1]?.userName}</h3>
                  </div>

                  {/* Right Container: Username and Message Preview */}
                  <div
                    className="p-4 bg-white rounded-lg shadow-sm border-4 border-[#203449] w-full sm:w-2/3 mt-4 sm:mt-0 hover:bg-[#fef2f2] hover:scale-105 transition-all duration-300"
                    onClick={() => navigate(`/chat/${conversation._id}`)}
                  >
                    <h3 className="font-semibold">{conversation.participants[1]?.userName}</h3>
                    <p className="text-sm text-black">{conversation.last_message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No conversations found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Match;
