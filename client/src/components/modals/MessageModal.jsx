import { useEffect } from "react";

const MessageModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  text,
  confirmText = 'Proceed',
  disableConfirm = false,
}) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-400 bg-opacity-50 z-50">
      <div className="bg-[#203449] border-[#E01D42] border-4 p-6 rounded-2xl shadow-lg w-1/3 animate-fadeIn">
        <h2 className="text-xl text-white font-semibold mb-4 text-center">{title}</h2>
        <p className="text-white text-center p-4 whitespace-pre-wrap">{text}</p>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white text-[#203449] font-semibold hover:bg-gray-400 transition"
          >
            Go back
          </button>
          <button
            onClick={onConfirm}
            disabled={disableConfirm}
            className={`px-4 py-2 rounded-lg bg-white text-[#203449] font-semibold hover:bg-gray-400 transition ${disableConfirm ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;