import React from "react";
import { Link } from "react-router-dom";
import { FaBook, FaHeart, FaChild, FaRing, FaQuestionCircle, FaBookOpen } from "react-icons/fa";
import { GiRose } from "react-icons/gi";

const LibraryCard = ({ icon: Icon, title, to }) => (
  <Link 
    to={to} 
    className="bg-pink-100 rounded-3xl p-8 flex items-center gap-6 hover:bg-pink-200 
    transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl 
    border-2 border-[#E01D42] min-h-[120px] relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-pink-100/50 to-transparent opacity-0 
    group-hover:opacity-100 transition-opacity duration-300" />
    <div className="bg-white/80 p-4 rounded-2xl shadow-md">
      <Icon className="text-[#14485A] text-4xl lg:text-5xl transition-transform duration-300 
      group-hover:scale-110" />
    </div>
    <h3 className="text-xl lg:text-2xl font-bold text-[#14485A] group-hover:translate-x-2 
    transition-transform duration-300">{title}</h3>
  </Link>
);

const Library = () => {
  const libraryItems = [
    {
      title: "Fatwas",
      icon: FaBook,
      to: "/library/fatwas"
    },
    {
      title: "Questions to Ask Your Spouse",
      icon: FaHeart,
      to: "/library/questions"
    },
    {
      title: "Parenting",
      icon: FaChild,
      to: "/library/parenting"
    },
    {
      title: "Rights of Husband and Wife",
      icon: GiRose,
      to: "/library/rights"
    },
    {
      title: "Fiqh: Nikah in the 4 Madhāhib",
      icon: FaBookOpen,
      to: "/library/fiqh"
    },
    {
      title: "FAQ",
      icon: FaQuestionCircle,
      to: "/library/faq"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Library;