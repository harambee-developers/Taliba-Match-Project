import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBook, FaHeart, FaFileAlt, FaRing, FaQuestionCircle, FaBookOpen } from "react-icons/fa";
import { GiRose } from "react-icons/gi";
import { useAuth } from "../components/contexts/AuthContext";
import MessageModal from "../components/modals/MessageModal";

const LibraryCard = ({ icon: Icon, title, to, onClick}) => (
  <a
    href={to}
    target="_blank"
    rel="noopener noreferrer"
    className="theme-btn rounded-3xl p-8 flex items-center gap-6 
    transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl 
    theme-border min-h-[120px] relative overflow-hidden group"
    onClick={onClick}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-pink-100/50 to-transparent opacity-0 
    group-hover:opacity-100 transition-opacity duration-300" />
    <div className="bg-white/80 p-4 rounded-2xl shadow-md">
      <Icon className="text-[#14485A] text-4xl lg:text-5xl transition-transform duration-300 
      group-hover:scale-110" />
    </div>
    <h3 className="text-xl lg:text-2xl font-bold group-hover:translate-x-2 
    transition-transform duration-300">{title}</h3>
  </a>
);

const Library = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const hasPlatinumAccess = user?.subscription?.type === "platinum" && user?.subscription?.status === "active";

  const libraryItems = [
    {
      title: "Fatwas",
      icon: FaBook,
      to: "https://sistersofhadith.com/talibah-library-fatwas"
    },
    {
      title: "Questions to Ask Your Spouse",
      icon: FaHeart,
      to: "https://sistersofhadith.com/talibah-library-questions"
    },
    {
      title: "Nikah Certificates",
      icon: FaFileAlt,
      to: "https://sistersofhadith.com/talibah-library-nikah-certificate"
    },
    {
      title: "Rights of Husband and Wife",
      icon: GiRose,
      to: "https://sistersofhadith.com/talibah-library-rights"
    },
    {
      title: "Fiqh: Nikah in the 4 Madhāhib",
      icon: FaBookOpen,
      to: "https://sistersofhadith.com/talibah-library-nikah"
    },
    {
      title: "FAQ",
      icon: FaQuestionCircle,
      to: "https://sistersofhadith.com/talibah-library-faq"
    }
  ];

  // Handle click on library card: open modal if no platinum access
  const handleCardClick = (e, to) => {
    if (!hasPlatinumAccess) {
      e.preventDefault(); // prevent opening the link
      setIsUpgradeModalOpen(true);
      return;
    }
    // If has access, let the link work normally
  };

  return (
    <div className="min-h-screen theme-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-[#14485A]">Library</h1>
        <p className="text-gray-600 mb-12 text-lg">Explore our collection of Islamic resources for marriage and family life</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {libraryItems.map((item, index) => (
            <LibraryCard
              key={index}
              icon={item.icon}
              title={item.title}
              to={item.to}
              onClick={(e) => handleCardClick(e, item.to)}
            />
          ))}
        </div>
      </div>
      {/* Upgrade Prompt Modal */}
      <MessageModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Restricted Feature!"
        text="Upgrade to a Platinum plan to access the Library."
        onConfirm={() => {
          setIsUpgradeModalOpen(false);
          navigate("/subscribe");
        }}
        confirmText="View Pricing"
      />
    </div>

  );
};

export default Library;