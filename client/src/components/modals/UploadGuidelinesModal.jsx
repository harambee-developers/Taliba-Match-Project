import React from 'react';

const UploadGuidelinesModal = ({ isOpen, onClose, onProceed }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1e293b] text-white p-8 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">Guidelines</h2>
        
        <div className="space-y-4 mb-8">
          <p className="font-medium mb-4">
            Only send a Shariah compliant picture, ensuring your 'awrah is covered and you observe modesty.
          </p>
          
          <div className="mt-6 italic text-gray-300 text-center">
            "Indeed, Allah is over all things Seeing."
            <div className="text-sm">(Surah Al-Hujurat, 49:18)</div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadGuidelinesModal; 