import React from 'react';

const Alert = ({ message, type = 'info', onClose }) => {
  const typeStyles = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };

  return (
    <div
      className={`flex items-start border-l-4 p-4 rounded shadow-md max-w-sm ${
        typeStyles[type]
      }`}
    >
      <div className="flex-grow">
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <span className="text-lg font-bold">&times;</span>
      </button>
    </div>
  );
};

export default Alert;
