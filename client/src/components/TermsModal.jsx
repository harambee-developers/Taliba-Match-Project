import React from 'react';

const TermsModal = ({ isOpen, onClose }) => {
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
          <h1 className="text-2xl font-bold text-[#1A495D]">Terms and Conditions</h1>
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
            <p className="text-gray-600">Effective Date: Saturday, 31st of May 2025</p>
          </div>

          <div className="space-y-8">
            <section>
              <p className="text-gray-700 mb-6">
                Welcome to Talibah (<a href="https://talibah.co.uk" className="text-[#1A495D] hover:underline">https://talibah.co.uk</a>), an Islamic matrimony platform designed for Muslims seeking marriage in a manner that upholds Islamic values.
              </p>
              <p className="text-gray-700 mb-6">
                These Terms and Conditions outline the rules of using our platform. By registering on Talibah, you agree to these terms in full.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#1A495D] mb-4">1. Eligibility</h2>
              <p className="text-gray-700 mb-4">To use Talibah, you must:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Be at least 18 years old</li>
                <li>Be sincerely seeking a spouse</li>
                <li>Provide accurate and truthful information about yourself</li>
                <li>Use the platform solely for the purpose of seeking a marriage</li>
              </ul>
              <p className="text-gray-700 mt-4">We reserve the right to suspend or delete accounts that violate these conditions.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#1A495D] mb-4">2. Account and Profile Usage</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You are responsible for maintaining your login credentials.</li>
                <li>Do not impersonate others or provide misleading information.</li>
                <li>Profiles are visible to the opposite gender only.</li>
                <li>Photos may be shared, but voice notes, audio calls, and video calls are not allowed.</li>
                <li>Talibah admins and AI may access user messages for moderation and safety purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#1A495D] mb-4">3. Subscription Plans</h2>
              <p className="text-gray-700 mb-4">Talibah offers three subscription tiers:</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1A495D]">Free Plan (£0/month):</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Create a profile</li>
                    <li>Access to the Fatwa feature to ask questions to the Talibah Scholar Team (responses not guaranteed)</li>
                    <li>Unlimited match requests</li>
                    <li>Browse profiles (without full bios)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#1A495D]">Gold Plan (£9.99/month):</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>All Free features</li>
                    <li>View full profiles</li>
                    <li>Accept and initiate conversations with approved matches</li>
                    <li>In-app chat access</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#1A495D]">Platinum Plan (£14.99/month):</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>All Gold features</li>
                    <li>Access to advanced match filters</li>
                    <li>Full access to the Talibah Islamic Resource Library, which includes:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Rights of Husband & Wife</li>
                        <li>Guide to Intimacy</li>
                        <li>Questions to Ask a Candidate</li>
                        <li>Nikāḥ Certificates</li>
                        <li>Islamic FAQs</li>
                        <li>Fiqh of Marriage content</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
              
              <p className="text-gray-700 mt-4">
                Subscriptions are billed monthly via Stripe. There are no refunds once a payment has been processed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#1A495D] mb-4">4. Communication Rules</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>All communication must remain respectful and within Islamic guidelines.</li>
                <li>You may only message a match after both parties approve the request.</li>
                <li>Users must not engage in inappropriate or harassing behavior.</li>
                <li>Moderation is in place to prevent khalwa and protect users from harm.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#1A495D] mb-4">5. Data Handling and Privacy</h2>
              <p className="text-gray-700 mb-4">By using Talibah, you agree to our Privacy Policy, which includes:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Data is stored securely on a private VPN using a MongoDB database, hosted on Namecheap.</li>
                <li>We store your data until you delete your account, or after 6 months of inactivity</li>
                <li>Admins may use your data to ensure platform safety, conduct analytics, and provide support</li>
                <li>Your profile is visible to other users unless you delete your account</li>
                <li>We reserve the right to use your email for marketing Talibah services and related Islamic initiatives (e.g. Islamic marriage courses or religious content)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#1A495D] mb-4">6. Inactive Accounts</h2>
              <p className="text-gray-700">
                We reserve the right to automatically delete accounts inactive for over 6 months in order to maintain a clean and relevant user base.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#1A495D] mb-4">7. User Conduct</h2>
              <p className="text-gray-700 mb-4">You must not:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Use Talibah for non-marital or casual interactions</li>
                <li>Pretend to be someone else or provide false information</li>
                <li>Share haram or inappropriate content</li>
                <li>Attempt to circumvent moderation or platform rules</li>
              </ul>
              <p className="text-gray-700 mt-4">Violating these terms may result in suspension or permanent account removal.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#1A495D] mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700">
                All content, designs, and resources on Talibah — including but not limited to texts, graphics, and Islamic resources — are owned by Talibah and may not be copied or redistributed without permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#1A495D] mb-4">9. Dispute Resolution</h2>
              <p className="text-gray-700">
                In case of dispute, we aim to resolve matters amicably. Users agree to first attempt informal resolution by contacting the Talibah team before pursuing any legal action.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#1A495D] mb-4">10. Legal Jurisdiction</h2>
              <p className="text-gray-700">
                Talibah operates under the laws of the United Arab Emirates, though we primarily serve users in the United Kingdom. Any disputes arising from platform use must be resolved in accordance with UAE law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#1A495D] mb-4">11. Marriage Advice Disclaimer</h2>
              <p className="text-gray-700">
                The Talibah Library provides educational resources and general advice on building a healthy marriage, including guidance on the Islamic rights and responsibilities of husbands and wives. These materials are intended for informational purposes only and do not constitute legal, marital, or religious authority. We do not claim to enforce or mandate any particular practice. Users are responsible for considering the laws, cultural norms, and legal frameworks applicable in their respective countries or regions when applying any of the information provided.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#1A495D] mb-4">12. Contact</h2>
              <p className="text-gray-700">
                For questions, support, or data-related inquiries, please contact us at:{' '}
                <a href="mailto:info@talibah.co.uk" className="text-[#1A495D] hover:underline">
                  info@talibah.co.uk
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal; 