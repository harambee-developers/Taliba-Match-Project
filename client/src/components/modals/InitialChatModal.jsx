import React from 'react';

const InitialChatModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1e293b] text-white p-8 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">Naseeha</h2>
        
        <div className="space-y-4 mb-8">
          <p className="font-medium mb-4">Before proceeding with the marriage meeting, remember to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fear Allah throughout all of your conversations</li>
            <li>Ask about your prerequisites in a spouse</li>
            <li>Refer to our library if you need help asking the right questions</li>
          </ul>
          
          <div className="mt-6 italic text-gray-300 text-center">
            "Indeed, Allah is over all things Seeing."
            <div className="text-sm">(Surah Al-Hujurat, 49:18)</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          I understand
        </button>
      </div>
    </div>
  );
};

export default InitialChatModal; 