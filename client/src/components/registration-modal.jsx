import React from 'react';

const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#FFF1FE] w-[90%] md:w-[50%] p-8 rounded-xl shadow-lg relative">
        <h2 className="text-2xl font-bold text-[#800020] text-center mb-6">Join Talibah Match</h2>
        <form className="space-y-6">
          <div className="flex flex-col">
            <label className="text-[#800020] font-medium">First Name</label>
            <input
              type="text"
              className="border border-[#800020] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#800020]"
              placeholder="Enter your first name"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[#800020] font-medium">Surname</label>
            <input
              type="text"
              className="border border-[#800020] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#800020]"
              placeholder="Enter your surname"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[#800020] font-medium">Gender</label>
            <select className="border border-[#800020] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#800020]">
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[#800020] font-medium">Email</label>
            <input
              type="email"
              className="border border-[#800020] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#800020]"
              placeholder="Enter your email"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[#800020] font-medium">Phone Number</label>
            <input
              type="tel"
              className="border border-[#800020] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#800020]"
              placeholder="Enter your phone number"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#800020] text-white py-3 rounded-full mt-6 hover:bg-[#9A1C30] transition"
          >
            Submit
          </button>
        </form>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-[#800020] text-white rounded-full p-2 hover:bg-[#9A1C30] transition"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Modal;
