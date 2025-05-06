import React, { useState, useEffect } from 'react';
import chat from '../assets/chat.png';
import logo from '../assets/logo.png';
import heart from '../assets/heart.png';
import puzzle from '../assets/puzzle.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/contexts/AuthContext';

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

const LandingPage = () => {
  // For the FAQ toggles
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate()
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/search');
    }
  }, [navigate, user]);

  usePageTitle("Welcome to Talibah!")

  return (
    <div className="flex flex-col items-center justify-center bg-[#FFF1FE] min-h-screen relative">
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row w-full min-h-screen z-20">
        {/* Left Section (Pink) */}
        <div className="lg:w-1/2 bg-[#FFF1FE] flex flex-col items-center justify-center p-6">
          <h1 className="text-5xl lg:text-6xl font-semibold font-[Montserrat] text-[#E01D42] text-center mb-4">
            Where Marriage Meets Knowledge
          </h1>
          {/* Get Started Button */}
          <button className="bg-[#E01D42] text-white text-lg font-semibold py-4 px-6 mt-4 hover:bg-[#A52A2A] transition duration-300 rounded-lg"
            onClick={() => {navigate("/register") }}>
            Get Started Now
          </button>
        </div>


        {/* Right Section (Blue) */}
        <div className="w-[85%] lg:w-[50%] bg-[#14485A] flex flex-col justify-center px-10 py-8 text-white relative mx-auto rounded-2xl lg:rounded-none mb-4 lg:mb-0 ">
          <div className="relative max-w-md mx-auto space-y-8">
            {[
              { icon: logo, title: "Create your profile", description: "Build your authentic profile highlighting your values and aspirations" },
              { icon: puzzle, title: "Find your Partner", description: "Discover compatible partners who share your vision" },
              { icon: chat, title: "Halal Conversation", description: "Engage in meaningful, guided conversations" },
              { icon: heart, title: "Marriage", description: "Begin your blessed journey together" },
            ].map((step, index) => (
              <div key={index} className="flex items-center space-x-6 relative">
                <div className="bg-white rounded-full flex items-center justify-center w-20 h-20">
                  <img
                    src={step.icon}
                    alt={step.title}
                    className="w-12 h-12 object-contain"
                    loading='lazy'
                  />
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold font-[Montserrat]">
                  {step.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Statement Section */}
      <section className="py-20 bg-gradient-to-r from-[#E01D42] to-[#990033] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-center mb-12">Our Mission</h2>
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-2xl font-semibold mb-4">Who We Are</h3>
                <p className="text-lg leading-relaxed">
                  "Talibah" represents a seeker of knowledge, and at Talibah, we honor this identity by connecting individuals who prioritize the deen and the pursuit of sacred knowledge.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-2xl font-semibold mb-4">Why Talibah?</h3>
                <p className="text-lg leading-relaxed">
                  In a world filled with distractions, Talibah is a place for those who value purpose-driven connections. With Allah's permission, we strive to make the path of marriage easier.
                </p>
              </div>

            {/* A Journey Built on Faith */}
            <div>
              <h2 className="text-3xl font-semibold mb-3">
                A Journey Built on Faith
              </h2>
              <p className="text-lg lg:text-xl leading-relaxed mb-6">
                Marriage is described in the Qur’an as a source of peace, love, and mercy, and we hold these values at the core of our service:
              </p>
              <blockquote className="bg-white/10 rounded-lg p-6 italic text-lg lg:text-xl">
                “And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy. Indeed, in that are signs for a people who give thought.” — <span className="font-semibold">Surah Ar-Rum (30:21)</span>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <div className="py-20 bg-[#FFF1FE]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-[#E01D42] text-center mb-12">Commonly Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "How do we ensure halal conversation?",
                answer: "To maintain halal interactions, all conversations are monitored by both advanced AI technology and the Taalibah team. This ensures the prevention of khalwa and safeguards Islamic guidelines.",
              },
              {
                question: "How does the process work?",
                answer: "Simply sign up and create your profile. Once registered, you will gain early access to browse other profiles on the site. When the platform fully launches, you can begin your journey to finding the ideal partner.",
              },
              {
                question: "What are private profiles?",
                answer: "Private profiles allow you to maintain complete control over your visibility. By locking your profile, you can safeguard your privacy and choose the right moment to reveal your information to a suitable partner.",
              },
              {
                question: "Why do we use Kunya's?",
                answer: "A kunya is a personalised nickname created by you! It's a thoughtful way to prioritise your privacy while fostering a comfortable user experience.",
              },
              {
                question: "How do we protect your privacy?",
                answer: "We prioritise your security by implementing robust encryption methods and cutting-edge security protocols to protect your personal details and interactions on our platform.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-6 focus:outline-none flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-xl font-medium text-[#14485A]">{faq.question}</span>
                  <span className="text-[#E01D42] transform transition-transform duration-200">
                    {openIndex === index ? "▲" : "▼"}
                  </span>
                </button>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6 text-gray-600"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
