import React, { useState } from 'react'
import talibahLogo from '../assets/talibahLogo.png';
import { Link } from "react-router-dom";
import { useAuth } from './contexts/AuthContext';
import Icon38 from './icons/Icon38';
import Sidebar from './Sidebar';
import LoginModal from './LoginModal';

const Navbar = () => {
  const { user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleLoginModal = () => {
    setIsLoginModalOpen(!isLoginModalOpen);
  };

  return (
    <>
      <div className="flex items-center justify-between w-full px-8 py-4 z-20 bg-[#FFF1FE] shadow-lg">
        {/* Left side - Logo and Title */}
        <div className="flex items-center">
          {user && (
            <div className="mr-4 cursor-pointer" onClick={toggleSidebar}>
              <Icon38 width={32} height={32} color="#E01D42" />
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

        {/* Right side - Navigation Links (only shown when user is not logged in) */}
        {!user && (
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