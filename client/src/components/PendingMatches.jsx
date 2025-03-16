import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PendingMatches = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [matches, setMatches] = useState([]);
    const userId = '67d5d9a6a1cca2d96762e4be'; // Hardcoded for now

    // 67d5d9a6a1cca2d96762e4be
    // 67d701e0b422cb32154b0254

    // Fetch data when the component mounts
    useEffect(() => {
        fetchPendingRequests();
        fetchMatches();
    }, []);

    // Fetch pending requests (for the current user, either as sender or receiver)
    const fetchPendingRequests = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/match/pending/${userId}`);
            setPendingRequests(response.data); // Assuming response.data is the list of pending requests
        } catch (error) {
            console.error('Error fetching pending requests: ', error);
        }
    };

    // Fetch accepted matches (for the current user, only those who accepted the match)
    const fetchMatches = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/match/matches/${userId}`);
            setMatches(response.data); // Assuming response.data is the list of accepted matches
        } catch (error) {
            console.error('Error fetching matches: ', error);
        }
    };

    // Get the user who made the request (either user1 or user2)
    const getPendingUser = (request) => {
        if (request.user1._id.toString() !== userId) {
            return request.user1; // If the logged-in user is not user1, display user1
        } else {
            return request.user2; // Otherwise, display user2
        }
    };

    // Accept match request
    const acceptRequest = async (matchId) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/match/accept/${matchId}`);
            fetchPendingRequests(); // Refresh pending requests after accepting
            fetchMatches(); // Refresh matches after accepting
            console.log('Match accepted:', response.data);
        } catch (error) {
            console.error('Error accepting match:', error);
        }
    };

    // Reject match request
    const rejectRequest = async (matchId) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/match/reject/${matchId}`);
            fetchPendingRequests(); // Refresh pending requests after rejecting
            console.log('Match rejected:', response.data);
        } catch (error) {
            console.error('Error rejecting match:', error);
        }
    };

    return (
        <div className="min-h-screen bg-white p-8">
            {/* Parent Container for Flexbox */}
            <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
                {/* Matches Section */}
                <div className="flex-1 bg-[#FFF1FE] p-6 rounded-lg shadow-md border-[#203449] border-4">
                    <h2 className="text-2xl font-semibold mb-4">Matches</h2>
                    {matches.length > 0 ? (
                        <div>
                            {matches.map((match, index) => {
                                const opponent = match.user1._id !== userId ? match.user1 : match.user2;
                                return (
                                    <div key={index} className="mb-4 p-4 bg-white rounded-lg shadow-sm border-4 border-[#E01D42]">
                                        <h3 className="font-semibold">{opponent.firstName} {opponent.lastName}</h3>
                                        <p className="text-gray-500">{opponent.userName}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No matches found.</p>
                    )}
                </div>

                {/* Pending Requests Section */}
                <div className="flex-1 bg-[#FFF1FE] p-6 rounded-lg shadow-md border-[#203449] border-4">
                    <h2 className="text-2xl font-semibold mb-4">Pending Requests</h2>
                    {pendingRequests.length > 0 ? (
                        <div>
                            {pendingRequests.map((request, index) => {
                                const userPending = getPendingUser(request); // Get the opponent
                                return (
                                    <div key={index} className="mb-4 p-4 bg-white rounded-lg shadow-sm border-4 border-[#E01D42]">
                                        <h3 className="font-semibold">{userPending.firstName} {userPending.lastName}</h3>
                                        <p className="text-gray-500">{userPending.userName}</p>
                                        <div className="flex space-x-4 mt-4">
                                            <button
                                                className="px-4 py-2 bg-green-500 text-white rounded"
                                                onClick={() => acceptRequest(request._id)}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="px-4 py-2 bg-red-500 text-white rounded"
                                                onClick={() => rejectRequest(request._id)}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No pending requests found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PendingMatches;
