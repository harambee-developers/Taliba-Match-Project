import React from 'react'

const LandingPage = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-[#FFF1FE]">
      {/* Left Section */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center p-8">
        <h1 className="text-5xl font-bold text-[#800020] mb-4">
          Where Marriage Meets Knowledge
        </h1>
        <button className="bg-[#800020] text-white py-2 px-6 rounded-full mt-4">
          Get Started
        </button>
      </div>

      {/* Right Section */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center p-8 bg-[#03054F] rounded-lg">
        <div className="space-y-6">
          <div className="flex flex-row items-center space-x-4">
            <div className="bg-white rounded-full h-10 w-10"></div>
            <span className="text-white text-lg">Create your profile</span>
          </div>

          <div className="flex flex-row items-center space-x-4">
            <div className="bg-white rounded-full h-10 w-10"></div>
            <span className="text-white text-lg">Find your match</span>
          </div>

          <div className="flex flex-row items-center space-x-4">
            <div className="bg-white rounded-full h-10 w-10"></div>
            <span className="text-white text-lg">Halal Conversation</span>
          </div>

          <div className="flex flex-row items-center space-x-4">
            <div className="bg-white rounded-full h-10 w-10"></div>
            <span className="text-white text-lg">Marriage</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage