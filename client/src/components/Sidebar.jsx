import React from "react";
import { Link } from "react-router-dom";
import Icon27 from './icons/Icon27';
import Icon52 from './icons/Icon52';
import Icon51 from './icons/Icon51';
import Icon29 from './icons/Icon29';
import Icon30 from './icons/Icon30';
import { useAuth } from "./contexts/AuthContext";

const Sidebar = ({ isOpen, toggleMenu }) => {

  const { user } = useAuth()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
          onClick={toggleMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 theme-sidebar text-white transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'
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
                  <Icon27 width={24} height={24} gender={user?.gender} />
                </Link>
              </li>
              <li>
                <Link
                  to="/matches"
                  onClick={toggleMenu}
                  className="flex items-center justify-between p-2 rounded theme-btn transition-colors"
                >
                  <span>Speak to your Match</span>
                  <Icon52 width={24} height={24} gender={user?.gender} />
                </Link>
              </li>
              <li>
                <Link
                  to="/pending-matches"
                  onClick={toggleMenu}
                  className="flex items-center justify-between p-2 rounded theme-btn transition-colors"
                >
                  <span>Matches & Requests</span>
                  <Icon51 width={24} height={24} gender={user?.gender} />
                </Link>
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
                  <Icon30 width={24} height={24} gender={user?.gender} />
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
