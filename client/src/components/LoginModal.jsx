import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import { useAuth } from './contexts/AuthContext';
import { useAlert } from './contexts/AlertContext';
import Alert from './Alert';

const LoginModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { showAlert, alert } = useAlert();
    const { login } = useAuth();

    const resetForm = () => {
        setEmail("");
        setPassword("");
    };

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            showAlert("You have successfully logged in!", "success");
            resetForm();
            onClose();
        } catch (error) {
            showAlert(error.message, "error");
            console.error("Login failed:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center z-50">
            {/* Render alert component */}
            {alert}
            <div className="w-[85%] lg:w-96 p-6 shadow-lg bg-[#E01D42] rounded-lg relative">
                <button
                    onClick={() => {
                        resetForm();
                        onClose();
                    }}
                    className="absolute top-4 right-4 text-white hover:text-gray-300"
                >
                    <span className="text-2xl">&times;</span>
                </button>
                <h1 className="text-2xl flex justify-center text-center font-semibold gap-2 mb-4 text-white">
                    <FaUser />
                    Login
                </h1>
                <form onSubmit={handleLogin}>
                    <div className="mt-3">
                        <label htmlFor="email" className="block text-sm mb-2 font-semibold text-white">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email..."
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            id="email"
                            className="border focus:border-2 w-full text-sm px-2 py-2 focus:outline-none focus:ring-0 focus:border-blue-600 rounded-md"
                            required
                        />
                    </div>
                    <div className="mt-3">
                        <label htmlFor="password" className="block text-sm mb-2 font-semibold text-white">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password..."
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            id="password"
                            className="border w-full text-sm px-2 py-2 focus:outline-none focus:ring-0 focus:border-blue-600 focus:border-2 rounded-md"
                            required
                        />
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                        <div>
                            <a
                                href="/"
                                className="text-white hover:text-blue-300 text-sm"
                            >
                                Forgot Password?
                            </a>
                        </div>
                    </div>
                    <div className="mt-5">
                        <button
                            type="submit"
                            className="border bg-white text-[#E01D42] font-semibold py-3 px-6 rounded-md shadow-md hover:bg-gray-100 w-full"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal; 