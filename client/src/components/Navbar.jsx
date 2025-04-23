import React, { useState, useRef, useEffect } from 'react'
import talibahLogo from '../assets/talibahLogo.png';
import { Link } from "react-router-dom";
import { useAuth } from './contexts/AuthContext';
import Icon38 from './icons/Icon38';
import Sidebar from './Sidebar';
import LoginModal from './modals/LoginModal';
import { useNotification } from './contexts/NotificationContext';

const Navbar = () => {
  const { user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { notificationCount, notifications, markAsRead, markAllAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleLoginModal = () => {
    setIsLoginModalOpen(!isLoginModalOpen);
  };

  // Optionally, reset the notification count on clicking the bell
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    // Optionally, navigate to the notifications/messages page
  };

  // Optionally close the dropdown when clicking outside it
  const dropdownRef = useRef();
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const photoUrl = user?.photos?.[0]?.url;

  const fallbackUrl =
    user?.gender === "Male"
      ? "/icon_man5.png"
      : "/icon_woman6.png";


  return (
    <>
      <div className="flex items-center justify-between w-full px-8 py-4 z-20 theme-bg shadow-lg">
        {/* Left side - Logo and Title */}
        <div className="flex items-center">
          {user && (
            <div className="theme-btn mr-4 cursor-pointer rounded-full shadow-lg py-2 px-2" onClick={toggleSidebar}>
              <Icon38 width={24} height={24} className='' />
            </div>
          )}
          <Link to='/'>
            <img
              src={talibahLogo}
              alt="Talibah Match Logo"
              className="w-12 h-12"
            />
          </Link>
        </div>

        {/* Right side */}
        {user ? (
          // When user is logged in, show notification bell and profile icon placeholders
          <div className="flex items-center gap-4">
            {/* Greeting Text */}
            <div className="hidden lg:block text-right">
              <span className="block text-sm text-gray-600">Asalamualeikum,</span>
              <span className="block text-base font-semibold text-gray-800">
                Welcome {user.firstName}!
              </span>
            </div>
            {/* Notification Bell Icon */}
            <div className="relative cursor-pointer rounded-full" onClick={handleNotificationClick} title="Notifications">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 theme-btn-text"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs w-5 h-5 
                  flex items-center justify-center rounded-full">
                  {notificationCount}
                </span>
              )}
            </div>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div
                ref={dropdownRef}
                className="fixed top-6 right-6 w-80 theme-bg theme-border shadow-xl rounded-xl overflow-hidden z-50 transform transition-all duration-300"
              >
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {unreadNotifications.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-gray-500">No notifications</p>
                    </div>
                  ) : (
                    <ul>
                      {unreadNotifications.map((notif) => (
                        <li
                          key={notif._id}
                          className="px-4 py-3 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                        >
                          <p className="text-gray-700" onClick={() => markAsRead(notif._id)}>{notif.text}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button
                    onClick={markAllAsRead}
                    className="w-full py-2 theme-btn text-white rounded-lg transition-colors duration-200"
                  >
                    Mark All as Read
                  </button>
                </div>
              </div>
            )}

            {/* Profile Icon Placeholder */}
            <div className="cursor-pointer rounded-full object-contain theme-border" title="Profile">
              <img
                src={photoUrl || fallbackUrl}
                alt={user?.gender === "Male" ? "man" : "woman"}
                className="h-16 w-16 object-contain rounded-full"
              />
            </div>
          </div>
        ) : (
          // When user is not logged in, show navigation links
          <div className="flex items-center gap-8">
            <Link to="/about" className="text-[#4A0635] hover:text-[#E01D42] font-medium">
              About
            </Link>
            <button
              onClick={toggleLoginModal}
              className="text-[#4A0635] hover:text-[#E01D42] font-medium"
            >
              Login
            </button>
            <Link to="/register" className="text-[#4A0635] hover:text-[#E01D42] font-medium">
              Register
            </Link>
          </div>
        )}
      </div>
      <Sidebar isOpen={isSidebarOpen} toggleMenu={toggleSidebar} />
      <LoginModal isOpen={isLoginModalOpen} onClose={toggleLoginModal} />
    </>
  )
}

export default Navbar