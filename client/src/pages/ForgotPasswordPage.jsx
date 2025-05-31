import React, { useState } from 'react';
import { useAuth } from '../components/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/contexts/AlertContext';
import Alert from "../components/Alert";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const { resetPassword } = useAuth(); // Assumes you have a resetPassword function in your Auth context
  const { alert, showAlert } = useAlert();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      showAlert("Password reset email sent. Please check your inbox.", "success");
      // Optionally, navigate back to the login page after successful request
      navigate('/');
    } catch (error) {
      showAlert(error.message, "error");
      console.error("Password reset failed:", error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen theme-bg">
        {alert && <Alert />}
        <div className="w-96 p-8 bg-white rounded-xl shadow-2xl transform transition-all duration-300">
          <h1 className="text-2xl text-center font-semibold text-gray-800 mb-6">
            Reset Password
          </h1>
          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF1F5A] focus:border-[#FF1F5A] transition duration-200"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full theme-btn text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200"
              >
                Send Reset Instructions
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <a href="/" className="text-sm text-blue-600 hover:text-indigo-400">
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
