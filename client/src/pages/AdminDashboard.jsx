import { React, useState } from "react";
import Settings from "../components/admin/Settings";
import { FaCogs, FaUserCircle, FaArrowLeft, FaBars } from "react-icons/fa";
import Dashboard from "../components/admin/Dashboard";
import UserTable from "../components/admin/UserTable";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate()

  const tabs = ["Dashboard", "Settings", "Users", "Logout"];

  const handleOnClick = (value) => {
    setSelectedTab(value);
    setIsSidebarOpen(false); // Close sidebar after selection on mobile
  };

  const renderIcon = (option) => {
    switch (option) {
      case "Dashboard":
        return <FaUserCircle className="inline mr-3" />;
      case "Settings":
        return <FaCogs className="inline mr-3" />;
      case "Users":
        return <FaBars className="inline mr-3" />;
      case "Logout":
        return <FaArrowLeft className="inline mr-3" />;
      default:
        return null;
    }
  };

  const renderComponent = () => {
    switch (selectedTab) {
      case "Dashboard":
        return <Dashboard />;
      case "Users":
        return <UserTable />;
      case "Settings":
        return <Settings />;
      default:
        return navigate('/admin');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FFF1FE]">
      {/* Mobile Toggle Button */}
      <div className="lg:hidden bg-[#800020] text-white p-4 flex justify-between items-center z-20">
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <FaBars size={20} />
        </button>
      </div>

      {/* Sidebar */}
      <nav
        className={`${
          isSidebarOpen ? "block" : "hidden"
        } lg:block bg-[#800020] text-white flex-shrink-0 w-full lg:w-64 absolute lg:static z-10`}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        </div>
        <ul>
          {tabs.map((option) => (
            <li
              key={option}
              className="px-6 py-3 hover:bg-blue-700 text-white"
            >
              <button
                onClick={() => handleOnClick(option)}
                className="flex items-center w-full text-left"
              >
                {renderIcon(option)}
                <span className="text-sm">{option}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6">
        <header className="bg-white shadow p-4 lg:p-6 rounded-md mb-4 lg:mb-6">
          <h2 className="text-xl lg:text-2xl font-semibold text-[#800020]">
            Welcome, Admin
          </h2>
        </header>
        <section className="flex-1">{renderComponent()}</section>
      </main>
    </div>
  );
};

export default AdminDashboard;
