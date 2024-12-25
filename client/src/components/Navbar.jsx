import React from 'react'
import talibahLogo from '../assets/talibahLogo.png';

const Navbar = () => {
  return (

    
    <div className="flex items-center w-full px-8 py-4 z-20 bg-[#FFF1FE]">
    <img
      src={talibahLogo}
      alt="Talibah Match Logo"
      className="w-12 h-12"  // Increased logo size
    />
    <h1 className="text-2xl font-semibold text-[#800020] ml-4 font-[Manrope]">  {/* Increased font size and made semibold */}
      Talibah Match
    </h1>
  </div>
  )
}

export default Navbar