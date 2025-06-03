import React from 'react';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Handle click outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-lg p-8 max-w-4xl w-[90%] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A495D]">Privacy Policy</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-center mb-8">
            <p className="text-gray-600">Effective Date: March 2024</p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">Data Collection and Consent</h2>
              <p className="text-gray-700 mb-6">
                No data will be collected unless this consent is actively provided.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">Jurisdiction and Legal Compliance</h2>
              <p className="text-gray-700 mb-6">
                Talibah is operated from the United Arab Emirates but serves users worldwide, including
                the United Kingdom. We comply with the UK General Data Protection Regulation (UK
                GDPR) and other applicable data protection laws in handling your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">Contact for Data Protection</h2>
              <p className="text-gray-700 mb-6">
                If you have questions or concerns about your data, please contact our data
                protection representative at: <a href="mailto:info@talibah.co.uk" className="text-[#1A495D] hover:underline">info@talibah.co.uk</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">User Conduct</h2>
              <p className="text-gray-700 mb-6">
                Users must not use the platform to sell, advertise, or promote any products or services. All
                forms of fundraising, including collecting donations or asking for money, are strictly
                prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">Intellectual Property</h2>
              <p className="text-gray-700">
                All resources provided on the platform may not be copied, distributed, modified, or reused in
                any form.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal; 