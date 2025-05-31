import React, { useState, useEffect } from 'react';
import { FaUser, FaExclamationCircle, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [touched, setTouched] = useState({
        email: false,
        password: false
    });
    const { showAlert } = useAlert();
    const { login } = useAuth();
    const navigate = useNavigate();

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
        setLoginError("");
        
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
            const errorMessage = error.message || "Login failed";
            setLoginError(errorMessage);
            showAlert(errorMessage, "error");
            console.error("Login failed:", error);
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className="w-[90%] max-w-md p-8 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 hover:scale-[1.02]">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaUser className="text-[#E01D42]" />
                        Welcome Back
                    </h1>
                    <button
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {loginError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2 animate-fade-in">
                            <FaExclamationCircle className="flex-shrink-0" />
                            {loginError}
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => handleBlur('email')}
                                value={email}
                                id="email"
                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E01D42] focus:border-transparent ${
                                    touched.email && errors.email ? 'border-red-500 bg-red-50' : 
                                    touched.email && !errors.email ? 'border-green-500 bg-green-50' : 
                                    'border-gray-300 hover:border-gray-400'
                                }`}
                                aria-invalid={touched.email && errors.email ? "true" : "false"}
                            />
                            {touched.email && errors.email && (
                                <FaExclamationCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500" />
                            )}
                            {touched.email && !errors.email && email && (
                                <FaCheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500" />
                            )}
                        </div>
                        {touched.email && errors.email && (
                            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => handleBlur('password')}
                                value={password}
                                id="password"
                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E01D42] focus:border-transparent ${
                                    touched.password && errors.password ? 'border-red-500 bg-red-50' : 
                                    touched.password && !errors.password ? 'border-green-500 bg-green-50' : 
                                    'border-gray-300 hover:border-gray-400'
                                }`}
                                aria-invalid={touched.password && errors.password ? "true" : "false"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            {touched.password && errors.password && (
                                <FaExclamationCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 text-red-500" />
                            )}
                            {touched.password && !errors.password && password && (
                                <FaCheckCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-500" />
                            )}
                        </div>
                        {touched.password && errors.password && (
                            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <a
                            href="/forgotten-password"
                            className="text-sm text-[#E01D42] hover:text-[#c01838] transition-colors duration-200"
                        >
                            Forgot Password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                            isSubmitting 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-[#E01D42] hover:bg-[#c01838] shadow-lg hover:shadow-xl'
                        }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal; 