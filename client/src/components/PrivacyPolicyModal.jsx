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
            <p className="text-gray-600">Effective Date: Saturday, 31st of May 2025</p>
          </div>

          <div className="space-y-8">
            <p className="text-gray-700">
              At Talibah (<a href="https://talibah.co.uk" className="text-[#1A495D] hover:underline">https://talibah.co.uk</a>), we take your privacy seriously. This Privacy Policy
              explains what data we collect, how we use it, who we may share it with, and how you can
              manage your personal information.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">1. Data We Collect</h2>
              <p className="text-gray-700 mb-4">When you create an account on our platform, we collect the following information:</p>
              
              <h3 className="text-lg font-semibold text-[#1A495D] mb-2">Basic Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>First Name, Last Name, Preferred Kunya</li>
                <li>Date of Birth (DOB), Gender</li>
                <li>Email Address, Password</li>
                <li>Phone Number, Country of Residence</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#1A495D] mb-2">Religious and Cultural Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Are You Open to Making Hijrah?</li>
                <li>Ethnicity, Nationality</li>
                <li>Languages Spoken</li>
                <li>Marital Status (e.g. married, divorced)</li>
                <li>Are You a Revert? (and for how long)</li>
                <li>Do You Have Children?</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#1A495D] mb-2">Islamic Practice</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Prayer Habits (Salah Pattern)</li>
                <li>Sect, Madhab</li>
                <li>Islamic Books Studied</li>
                <li>Quran Memorization (Hifdh Status)</li>
                <li>Dressing Style (e.g. Hijab, Niqab, etc.)</li>
                <li>View on Polygamy</li>
                <li>Islamic Goals & Ambitions</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#1A495D] mb-2">Personality & Lifestyle</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>About Me</li>
                <li>Personality Traits</li>
                <li>Hobbies & Interests</li>
                <li>Deal Breakers and Non-Negotiables</li>
                <li>Occupation</li>
                <li>Height and Weight (for profile preferences)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">2. Why We Collect Your Data</h2>
              <p className="text-gray-700 mb-4">We collect your data in order to:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Match you with a suitable and compatible marriage partner</li>
                <li>Understand user preferences to improve our platform and services</li>
                <li>Provide personalized content and suggestions</li>
                <li>Ensure safety and moderation within the platform</li>
                <li>Contact you via email or SMS with important updates or notifications</li>
                <li>Perform analytics to improve user experience and track growth</li>
                <li>Send you updates about Talibah services and related offerings (e.g. Islamic marriage courses or educational resources). You may opt out at any time by following the unsubscribe link in our emails.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">3. How Your Data Is Stored</h2>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Your data is stored securely on a private VPN using a MongoDB database, hosted on Namecheap.</li>
                <li>We implement standard security measures such as encryption, firewall protection, and controlled access.</li>
                <li>All passwords are hashed and not stored in plain text.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">4. Data Retention and Inactive Accounts</h2>
              <p className="text-gray-700">
                We retain your data for as long as your account is active. If your account remains inactive for
                more than 6 months, we reserve the right to delete it permanently to maintain system
                integrity. You may delete your account manually at any time through your dashboard.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">5. Who Has Access to Your Data</h2>
              <p className="text-gray-700 mb-4">
                We do not sell your data. We may share limited personal information with trusted third-party
                service providers to enhance the functionality of our platform. These may include:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Email & SMS providers (e.g. Mailgun, Twilio)</li>
                <li>Analytics and performance monitoring (e.g. Google Analytics)</li>
                <li>Hosting and storage (e.g. AWS)</li>
                <li>Payment processors (e.g. Stripe)</li>
                <li>Customer support tools (e.g. Zendesk)</li>
                <li>Identity verification tools (e.g. Onfido)</li>
                <li>Ad networks or CRM tools (if implemented in the future)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                These providers are contractually obligated to handle your data securely and use it solely for
                providing services on our behalf.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">6. Profile Visibility and Messaging</h2>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Your profile is visible to other registered users on the platform unless you delete your account.</li>
                <li>Our admin team and AI moderation systems may access user messages and profiles solely for moderation and compliance purposes, including ensuring safety and preventing inappropriate or unlawful conduct.</li>
                <li>Users are responsible for blocking or reporting any individuals who display inappropriate or unwanted behaviour.</li>
                <li>Users may also delete their messages at any time, which will remove the message for both parties.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">7. Access, Editing, and Deletion</h2>
              <p className="text-gray-700 mb-4">You have full control over your account. At any time, you may:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Access your profile</li>
                <li>Edit any information</li>
                <li>Delete your account permanently</li>
              </ul>
              <p className="text-gray-700 mt-4">
                This can be done directly through your profile dashboard.
                If you wish to request a full data export or have any trouble managing your data, please
                contact us at: <a href="mailto:admin@talibah.co.uk" className="text-[#1A495D] hover:underline">admin@talibah.co.uk</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">We may use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Remember your login session</li>
                <li>Improve site functionality and performance</li>
                <li>Understand user behavior through analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">9. Consent</h2>
              <p className="text-gray-700 mb-4">By creating an account and ticking the checkbox upon registration, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Our Privacy Policy</li>
                <li>Our Terms and Conditions</li>
                <li>The collection and processing of your data as described above</li>
              </ul>
              <p className="text-gray-700 mt-4">
                No data will be collected unless this consent is actively provided.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">10. Jurisdiction and Legal Compliance</h2>
              <p className="text-gray-700">
                Talibah is operated from the United Arab Emirates but serves users worldwide, including
                the United Kingdom. We comply with the UK General Data Protection Regulation (UK
                GDPR) and other applicable data protection laws in handling your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">11. Contact for Data Protection</h2>
              <p className="text-gray-700">
                If you have questions or concerns about your data, please contact our data
                protection representative at: <a href="mailto:info@talibah.co.uk" className="text-[#1A495D] hover:underline">📧 info@talibah.co.uk</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">12. User Conduct</h2>
              <p className="text-gray-700">
                Users must not use the platform to sell, advertise, or promote any products or services. All
                forms of fundraising, including collecting donations or asking for money, are strictly
                prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A495D] mb-4">13. Intellectual Property</h2>
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