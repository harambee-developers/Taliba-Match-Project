import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from './contexts/AuthContext';
import Icon26 from './icons/Icon26';
import Icon27 from './icons/Icon27';
import Icon28 from './icons/Icon28';
import Icon29 from './icons/Icon29';
import Icon30 from './icons/Icon30';

// For debugging purposes
console.log('Icon30 loaded:', Icon30);

const Sidebar = ({ isOpen, toggleMenu }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [matchesOpen, setMatchesOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toggleMenu();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity"
          onClick={toggleMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 theme-sidebar text-white transform transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <nav className="flex flex-col h-full">
          <div className="p-4 flex-grow">
            <ul className="space-y-4">
              <li>
                <Link
                  to="/profile"
                  onClick={toggleMenu}
                  className="flex items-center justify-between p-2 rounded theme-btn transition-colors"
                >
                  <span>Your Profile</span>
                  <Icon27 width={24} height={24} color="#FFF" />
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setMatchesOpen(!matchesOpen)}
                  className="flex items-center justify-between w-full p-2 rounded theme-btn transition-colors"
                >
                  <span>Your Matches</span>
                  <Icon28 width={24} height={24} color="#FFF" />
                </button>
                {matchesOpen && (
                  <ul className="ml-6 mt-2 space-y-2 text-sm text-white">
                    <li>
                      <Link
                        to="/pending-matches"
                        onClick={toggleMenu}
                        className="block p-2 rounded theme-btn transition-colors"
                      >
                        Pending
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/matches"
                        onClick={toggleMenu}
                        className="block p-2 rounded theme-btn transition-colors"
                      >
                        Matches
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <Link
                  to="/search"
                  onClick={toggleMenu}
                  className="flex items-center justify-between p-2 rounded theme-btn transition-colors"
                >
                  <span>Search</span>
                  <Icon29 width={24} height={24} color="#FFF" />
                </Link>
              </li>
              <li>
                <Link
                  to="/library"
                  onClick={toggleMenu}
                  className="flex items-center justify-between p-2 rounded theme-btn transition-colors"
                >
                  <span>Library</span>
                  <Icon30 width={24} height={24} color="#FFF" />
                </Link>
              </li>
              <li>
                <Link
                  to="/membership"
                  onClick={toggleMenu}
                  className="flex items-center justify-between p-2 rounded theme-btn transition-colors"
                >
                  <span>Membership</span>
                  <Icon27 width={24} height={24} color="#FFF" />
                </Link>
              </li>
            </ul>
          </div>
          {/* Logout Button */}
          <div className="p-4 theme-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded theme-btn transition-colors text-white"
            >
              Logout
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
