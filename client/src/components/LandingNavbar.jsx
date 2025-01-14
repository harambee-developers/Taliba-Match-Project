import React from 'react';
import talibahLogo from '../assets/talibahLogo.png';
import { Link } from "react-router-dom";

const LandingNavbar = () => {
    return (
        <div className="relative w-full bg-[#FFF1FE] lg:flex">
            {/* Left Section */}
            <div className="flex items-center w-full lg:w-1/2 px-8 py-4 z-20">
                <Link to="/">
                    <img
                        src={talibahLogo}
                        alt="Talibah Match Logo"
                        className="w-12 h-12"
                    />
                </Link>
                <h1 className="text-2xl font-bold text-[#800020] ml-4 font-[Montserrat]">
                    Talibah Match
                </h1>
            </div>

            {/* Right Section (Blue Background) */}
            <div className="hidden lg:block lg:w-1/2 bg-[#14485A]">
                {/* Optional content for the blue section */}
            </div>
        </div>
    );
};

export default LandingNavbar;