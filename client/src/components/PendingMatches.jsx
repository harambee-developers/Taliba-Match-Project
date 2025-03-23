import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/contexts/AlertContext';
import Alert from '../components/Alert';

const PendingMatches = () => {
    const [pendingSentRequests, setPendingSentRequests] = useState([]);
    const [pendingReceivedRequests, setPendingReceivedRequests] = useState([])
    const userId = '67d865d4f33b666fd7ebe581'; // Hardcoded for now
    const { alert, showAlert } = useAlert()

    // 67d865d4f33b666fd7ebe581
    // 67d865d4f33b666fd7ebe57f

    // Fetch data when the component mounts
    useEffect(() => {
        fetchSentPendingRequests()
        fetchReceivedPendingRequests()
    }, []);

    // Fetch pending requests for the current user as a sender
    const fetchSentPendingRequests = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/match/pending/sent/${userId}`);
            setPendingSentRequests(response.data);
        } catch (error) {
            console.error('Error fetching pending requests: ', error);
        }
    };

    // Fetch pending requests (for the current user as a receiver)
    const fetchReceivedPendingRequests = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/match/pending/received/${userId}`);
            setPendingReceivedRequests(response.data); 
        } catch (error) {
            console.error('Error fetching pending requests: ', error);
        }
    };

    // Accept match request
    const acceptRequest = async (matchId) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/match/accept/${matchId}`);
            // Remove the accepted match from pending requests
            setPendingReceivedRequests((prevRequests) =>
                prevRequests.filter(request => request._id !== matchId)
            );

            const pingSound = new Audio("/sounds/ping.mp3");
            // Play sound only if not already playing
            if (pingSound.paused) {
                pingSound.play();
            } else {
                pingSound.currentTime = 0; // Restart the sound if already playing
            }
            showAlert('Match accepted!', 'success')
            console.log('Match accepted:', response.data);
        } catch (error) {
            console.error('Error accepting match:', error);
            showAlert('Error accepting match', 'error')
        }
    };

    // Reject match request
    const rejectRequest = async (matchId) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/match/reject/${matchId}`);
            // Remove the accepted match from pending requests
            setPendingReceivedRequests((prevRequests) =>
                prevRequests.filter(request => request._id !== matchId)
            );
            showAlert('Match rejected!', 'success')
            console.log('Match rejected:', response.data);
        } catch (error) {
            console.error('Error rejecting match:', error);
            showAlert('Error rejecting match', 'error')
        }
    };

    return (
        <div className="min-h-screen bg-white p-8 border-t-4 border-[#203449]">
            {/* Render alert component */}
            {alert && <Alert />}
            {/* Parent Container for Flexbox */}
            <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
                {/* Matches & Pending Requests in One Section */}
                <div className="flex-1 bg-[#FFF1FE] p-6 rounded-lg shadow-md border-[#203449] border-4 min-h-[50vh]">
                    <h2 className="text-2xl font-semibold mb-4">Your Matches</h2>
                    {/* Loop through Received Pending Requests */}
                    {pendingReceivedRequests.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium mt-6 mb-2">Pending Requests (Received)</h3>
                            {pendingReceivedRequests.map((request, index) => (
                                <div key={index} className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow-sm border-4 border-[#E01D42]">
                                    <div>
                                        <h3 className="font-semibold">{request.sender.firstName} {request.sender.lastName}</h3>
                                        <p className="text-gray-500">{request.sender.userName}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <img src='/assets/greenTick.svg' alt='acceptTick' onClick={() => acceptRequest(request._id)} className="w-16 h-16 object-contain bg-white shadow-lg rounded-md cursor-pointer">
                                        </img>
                                        <img src='/assets/redTick.svg' alt='rejectTick' onClick={() => rejectRequest(request._id)} className="w-16 h-16 object-contain bg-white shadow-lg rounded-md cursor-pointer">
                                        </img>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Show message if no data */}
                    {pendingReceivedRequests.length === 0 && (
                        <div className='flex-1 flex items-center justify-center'>
                            <p className="text-center text-gray-500 text-lg">No matches or pending requests found.</p>
                        </div>
                    )}
                </div>

                {/* Pending Sent Requests Section*/}
                <div className="flex-1 bg-[#FFF1FE] p-6 rounded-lg shadow-md border-[#203449] border-4 min-h-[50vh]">
                    <h2 className="text-2xl font-semibold mb-4">Pending Requests</h2>
                    {pendingSentRequests.length > 0 ? (
                        <div>
                            {pendingSentRequests.map((request, index) => {
                                return (
                                    <div key={index} className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow-sm border-4 border-[#E01D42] w-full">
                                        <div>
                                            <h3 className="font-semibold">{request.receiver.firstName} {request.receiver.lastName}</h3>
                                            <p className="text-gray-500">{request.receiver.userName}</p>
                                        </div>
                                        <div className="flex justify-center items-center ml-4">
                                            <span className="text-yellow-500 text-3xl">⌛</span>
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
        </div >
    );
};

export default PendingMatches;
