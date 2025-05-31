import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ConfirmationScreen component displays a confirmation message and redirects the user after a delay.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the confirmation screen
 * @param {string} props.message - Message displayed to the user
 * @param {string} props.redirectPath - Path to redirect the user after the delay
 * @returns {JSX.Element} The rendered ConfirmationScreen component.
 */
const ConfirmationScreen = ({ title, message, redirectPath }) => {
    const navigate = useNavigate();
    const [dots, setDots] = useState('');

    useEffect(() => {
        // Redirect after 3 seconds
        const timer = setTimeout(() => {
            navigate(redirectPath);
        }, 3000);

        // Animate the loading dots (e.g., "Loading.", "Loading..", "Loading...")
        const dotsInterval = setInterval(() => {
            setDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : ''));
        }, 300);

        return () => {
            clearTimeout(timer);
            clearInterval(dotsInterval);
        };
    }, [navigate, redirectPath]);

    return (
        <div className="flex items-center justify-center min-h-screen theme-bg">
            <div className="bg-white shadow-lg rounded-lg p-6 text-center max-w-md">
                <h2 className="text-2xl font-semibold text-[#E01D42]">{title}</h2>
                <p className="mt-2 text-gray-600">{message}</p>

                {/* Loading animation */}
                <div className="mt-4 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-opacity-75"></div>
                    <p className="mt-2 text-gray-500">Loading{dots}</p>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                    If you're not redirected,{' '}
                    <button onClick={() => navigate(redirectPath)} className="text-blue-600 hover:underline">
                        click here
                    </button>.
                </p>
            </div>
        </div>
    );
};

export default ConfirmationScreen;
