import { useEffect } from "react";

const MessageModal = ({ isOpen, onClose, onConfirm, title, text }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-10 z-50">
      <div className="bg-[#203449] border-[#E01D42] border-4 p-6 rounded-2xl shadow-lg w-96 animate-fadeIn">
        <h2 className="text-xl text-white font-semibold mb-4 text-center">{title}</h2>
        <p className="text-white text-center p-4">You are about to submit a match request. Would you like to continue?</p>
        <p className="text-white text-center p-4 font-bold">Remaining Free requests 1/3</p>
        <div className="flex justify-between">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg bg-white text-[#203449] font-semibold hover:bg-gray-400 transition"
          >
            Go back
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 rounded-lg bg-white text-[#203449] font-semibold hover:bg-gray-400 transition"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
