import React, { useState } from 'react';
import talibahLogo from '../assets/talibahLogo.png';
import hijabProfile from '../assets/hijabProfile.png';
import manProfile from '../assets/manProfile.png';
import chatIcon from '../assets/chatIcon.png';
import marriedIcon from '../assets/marriedIcon.png';
import Modal from "../components/registration-modal.jsx"; // Import Modal component

const LandingPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const openModal = () => setIsModalOpen(true); // Open modal
  const closeModal = () => setIsModalOpen(false); // Close modal

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-[#FFF1FE] min-h-screen relative">
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row w-full min-h-screen z-20">
        {/* Left Section (Pink) */}
        <div className="lg:w-1/2 bg-[#FFF1FE] flex flex-col items-center justify-center p-6">
          <h1 className="text-5xl lg:text-6xl font-semibold font-[Manrope] text-[#800020] text-center mb-4">
            Where Marriage Meets Knowledge
          </h1>
          <button onClick={openModal} className="bg-[#800020] text-white text-lg py-2 px-6 rounded-full shadow-lg hover:bg-[#9A1C30] transition">
            Get Started
          </button>
        </div>

        {/* Right Section (Blue) */}
        <div className="lg:w-[50%] bg-[#03054F] flex flex-col justify-center px-10 py-16 text-white relative rounded-l-lg"> {/* Adjusted for better responsiveness */}
          <div className="relative max-w-md mx-auto space-y-20"> {/* Updated alignment and spacing */}
            {[{
              icon: hijabProfile,
              title: "Create your profile",
            }, {
              icon: manProfile,
              title: "Find your match",
            }, {
              icon: chatIcon,
              title: "Halal Conversation",
            }, {
              icon: marriedIcon,
              title: "Marriage",
            }].map((step, index) => (
              <div key={index} className="flex items-center space-x-8 relative"> {/* Layout for each timeline step */}
                <div className="bg-white rounded-full flex items-center justify-center w-20 h-20"> {/* Large circle with icon */}
                  <img
                    src={step.icon}
                    alt={step.title}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold font-[Manrope]">{step.title}</h3> {/* Text for the step */}
                <div
                  className="absolute right-[-2.5rem] w-6 h-6 bg-white rounded-full" /* Smaller circle with line */
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                ></div>
              </div>
            ))}
            <div className="absolute right-[-2rem] top-10 w-1 bg-white" style={{ height: "calc(100% - 2.5rem)" }}></div> {/* Line connecting small circles */}
          </div>
        </div>
      </div>

      {/* Mission Statement Section */}
      <section className="w-[85%] lg:w-[75%] bg-[#800020] text-white py-12 px-8 mt-10 z-20 flex justify-center rounded-xl shadow-lg mx-auto"> {/* Modern layout */}
        <div className="max-w-4xl text-center">
          <p className="text-lg lg:text-xl leading-relaxed font-[Manrope]">
            At Talibah Match, we believe that marriage is not only a sacred bond but also a means of strengthening your connection to Allah and fulfilling a vital part of your deen. Our mission is to unite individuals who prioritize faith, knowledge, and the journey towards Jannah.
          </p>
          <p className="text-lg lg:text-xl leading-relaxed mt-6 font-[Manrope]">
            Seeking knowledge is a lifelong obligation for every Muslim, and with Allah’s permission, Talibah Match aims to ease this path by connecting you with like-minded individuals who share your values. Together, you can complete half your deen and support each other in your pursuit of faith, knowledge, and a fulfilling marital life.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <div className="w-full p-8 bg-[#FFF1FE] mt-8">
        <h2 className="text-2xl font-bold text-[#800020] text-center mb-6 font-[Manrope]">Commonly Asked Questions</h2>
        <div className="space-y-4 max-w-4xl mx-auto">
          {[{
            question: "How do we ensure halal conversation?",
            answer: "To maintain halal interactions, all conversations are monitored by both advanced AI technology and the Taalibah team. This ensures the prevention of khalwa (the seclusion of a man and woman) and safeguards Islamic guidelines."
          }, {
            question: "How does the process work?",
            answer: "Simply sign up and create your profile. Once registered, you will gain early access to browse other profiles on the site. When the platform fully launches, you can begin your journey to finding the ideal match."
          }, {
            question: "What are private profiles?",
            answer: "Private profiles allow you to maintain complete control over your visibility. By locking your profile, you can safeguard your privacy and choose the right moment to reveal your information to a suitable match."
          }, {
            question: "Why do we use Kunya’s?",
            answer: "A kunya is a personalized nickname created by you! It’s a thoughtful way to prioritize your privacy while fostering a comfortable user experience."
          }, {
            question: "How do we protect your privacy?",
            answer: "We prioritize your security by implementing robust encryption methods and cutting-edge security protocols to protect your personal details and interactions on our platform. Additionally, we are committed to transparency in data handling and adhere to the highest standards of compliance with data protection regulations."
          }].map((faq, index) => (
            <div key={index} className="bg-[#800020] border border-[#800020] text-white rounded-lg">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left p-4 focus:outline-none flex justify-between items-center"
              >
                <span className="text-lg font-medium font-[Manrope]">{faq.question}</span>
                <span className="text-gray-300">
                  {openIndex === index ? "▲" : "▼"}
                </span>
              </button>
              {openIndex === index && (
                <div className="p-4 text-sm font-[Manrope]">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} /> {/* Include Modal */}
    </div>
  );
};

export default LandingPage;
