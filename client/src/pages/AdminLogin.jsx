import { React, useState } from 'react'
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { useAuth } from '../components/contexts/AuthContext';
import { useAlert } from '../components/contexts/AlertContext';

const AdminLogin = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { alert, showAlert } = useAlert()
    const { login, } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async () => {
        try {
            await login(email, password)
            showAlert("You have successfully logged in!", "success");
            navigate('/admin/dashboard');
            // Navigate to the /admin/dashboard route after successful login
        } catch (error) {
            // Check if the error comes from the backend and has a response message.
            const errMessage = error.response?.data?.message || error.message || "Login failed";
            showAlert(errMessage, "error");
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-[#FFF1FE]">
            <div className="w-[85%] lg:w-96 p-6 shadow-lg bg-[#E01D42] rounded-md">
                <h1 className="text-2xl flex justify-center text-center font-semibold gap-2 mb-4 text-white">
                    <FaUser />
                    Admin Console
                </h1>
                <div className="mt-3">
                    <label htmlFor="email" className="block text-sm mb-2 font-semibold text-white">
                        {" "}
                        Email
                    </label>
                    <input
                        type="text"
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
                        {" "}
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
                        onClick={handleLogin}
                        className="border bg-white text-[#E01D42] font-semibold py-3 px-6 rounded-md shadow-md hover:bg-gray-100 w-full"
                        type="submit"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin