import React from 'react'
import talibahLogo from '../assets/talibahLogo.png';
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="flex items-center w-full px-8 py-4 z-20 bg-[#FFF1FE] ">
      <Link to='/'>
        <img
          src={talibahLogo}
          alt="Talibah Match Logo"
          className="w-12 h-12"  // Increased logo size
        />
      </Link>
    </div>
  )
}

export default Navbar