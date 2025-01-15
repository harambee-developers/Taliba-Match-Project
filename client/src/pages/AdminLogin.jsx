import { React, useState } from 'react'
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';

const AdminLogin = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [alert, setAlert] = useState(null); // For managing the alert message
    const navigate = useNavigate()

    const handleAlertClose = () => (
        setAlert(null)
    )

    const handleLogin = async () => {
        try {
            // Check if username and password match the hardcoded credentials
            if (username === "admin" && password === "adminpassword123") {
                setAlert({ message: "Successful Login!", type: "success" });

                // Navigate to the /admin/dashboard route after successful login
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 2000); // Optional: Delay the navigation by 2 seconds for UX purposes
            } else {
                // Incorrect credentials
                setAlert({ message: "Invalid username or password", type: "error" });
            }
        } catch (error) {
            setAlert({ message: error.message, type: "error" });
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-[#FFF1FE]">
            {alert && (
                <div className="fixed top-4 right-4">
                    <Alert
                        message={alert.message}
                        type={alert.type}
                        onClose={handleAlertClose}
                    />
                </div>
            )}
            <div className="w-96 p-6 shadow-lg bg-[#800020] rounded-md">
                <h1 className="text-2xl flex justify-center text-center font-semibold gap-2 mb-4 text-white">
                    <FaUser />
                    Admin Console
                </h1>
                <div className="mt-3">
                    <label htmlFor="username" className="block text-sm mb-2 font-semibold text-white">
                        {" "}
                        Username
                    </label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Enter Username..."
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        id="username"
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
                        className="border bg-white text-[#800020] font-semibold py-3 px-6 rounded-md shadow-md hover:bg-gray-100 w-full"
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