import React, { useState, useEffect } from 'react';
import { FaUser, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [touched, setTouched] = useState({
        email: false,
        password: false
    });
    const { showAlert } = useAlert();
    const { login } = useAuth();
    const navigate = useNavigate()

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setErrors({});
        setLoginError("");
        setTouched({
            email: false,
            password: false
        });
        setIsSubmitting(false);
    };

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};
        
        // Email validation
        if (!email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email is invalid";
        }
        
        // Password validation
        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle field blur for real-time validation
    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLoginError(""); // Clear previous login errors
        
        // Validate form before submission
        const isValid = validateForm();
        if (!isValid) {
            setIsSubmitting(false);
            return;
        }
        
        try {
            await login(email, password);
            showAlert("You have successfully logged in!", "success");
            resetForm();
            onClose();
            navigate("/profile")
        } catch (error) {
            // Extract error message with fallback
            const errorMessage = error.message || "Login failed";
            setLoginError(errorMessage);
            showAlert(errorMessage, "error");
            console.error("Login failed:", error);
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center z-50">
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
                <form onSubmit={handleLogin} noValidate>
                    {/* Display login error message */}
                    {loginError && (
                        <div className="mb-4 p-2 bg-red-600 text-white text-sm rounded">
                            <FaExclamationCircle className="inline mr-2" />
                            {loginError}
                        </div>
                    )}
                    
                    <div className="mt-3">
                        <label htmlFor="email" className="block text-sm mb-2 font-semibold text-white">
                            Email
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter email..."
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => handleBlur('email')}
                                value={email}
                                id="email"
                                className={`border w-full text-sm px-2 py-2 focus:outline-none focus:ring-0 focus:border-blue-600 rounded-md ${
                                    touched.email && errors.email ? 'border-red-500' : 
                                    touched.email && !errors.email ? 'border-green-500' : ''
                                }`}
                                aria-invalid={touched.email && errors.email ? "true" : "false"}
                            />
                            {touched.email && errors.email && (
                                <FaExclamationCircle className="absolute right-3 top-3 text-red-500" />
                            )}
                            {touched.email && !errors.email && email && (
                                <FaCheckCircle className="absolute right-3 top-3 text-green-500" />
                            )}
                        </div>
                        {touched.email && errors.email && (
                            <p className="mt-1 text-xs text-white bg-red-600 p-1 rounded">{errors.email}</p>
                        )}
                    </div>
                    <div className="mt-3">
                        <label htmlFor="password" className="block text-sm mb-2 font-semibold text-white">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter password..."
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => handleBlur('password')}
                                value={password}
                                id="password"
                                className={`border w-full text-sm px-2 py-2 focus:outline-none focus:ring-0 focus:border-blue-600 rounded-md ${
                                    touched.password && errors.password ? 'border-red-500' : 
                                    touched.password && !errors.password ? 'border-green-500' : ''
                                }`}
                                aria-invalid={touched.password && errors.password ? "true" : "false"}
                            />
                            {touched.password && errors.password && (
                                <FaExclamationCircle className="absolute right-3 top-3 text-red-500" />
                            )}
                            {touched.password && !errors.password && password && (
                                <FaCheckCircle className="absolute right-3 top-3 text-green-500" />
                            )}
                        </div>
                        {touched.password && errors.password && (
                            <p className="mt-1 text-xs text-white bg-red-600 p-1 rounded">{errors.password}</p>
                        )}
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                        <div>
                            <a
                                href="/forgotten-password"
                                className="text-white hover:text-blue-300 text-sm"
                            >
                                Forgot Password?
                            </a>
                        </div>
                    </div>
                    <div className="mt-5">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`border bg-white text-[#E01D42] font-semibold py-3 px-6 rounded-md shadow-md hover:bg-gray-100 w-full transition-all ${
                                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal; 