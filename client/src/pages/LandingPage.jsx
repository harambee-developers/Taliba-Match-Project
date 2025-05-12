import React, { useState, useEffect } from 'react';
import chat from '../assets/chat.png';
import logo from '../assets/logo.png';
import heart from '../assets/heart.png';
import puzzle from '../assets/puzzle.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/contexts/AuthContext';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gradient-to-b from-[#FFF1FE] to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#FFF1FE] opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/path-to-pattern.png')] opacity-5"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-7xl font-bold text-[#E01D42] mb-6 font-[Montserrat] leading-tight">
              Where Marriage Meets Knowledge
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Connect with like-minded individuals on a journey of faith and companionship
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#E01D42] text-white text-xl font-semibold py-4 px-8 rounded-full shadow-lg hover:bg-[#A52A2A] transition-all duration-300"
              onClick={() => navigate("/register")}
            >
              Begin Your Journey
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Process Steps Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#14485A] mb-16">Your Path to Marriage</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: logo, title: "Create your profile", description: "Build your authentic profile highlighting your values and aspirations" },
              { icon: puzzle, title: "Find your Partner", description: "Discover compatible partners who share your vision" },
              { icon: chat, title: "Halal Conversation", description: "Engage in meaningful, guided conversations" },
              { icon: heart, title: "Marriage", description: "Begin your blessed journey together" },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="bg-[#FFF1FE] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <img src={step.icon} alt={step.title} className="w-12 h-12 object-contain" />
                </div>
                <h3 className="text-xl font-semibold text-center text-[#14485A] mb-2">{step.title}</h3>
                <p className="text-gray-600 text-center">{step.description}</p>
              </motion.div>
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

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-2xl font-semibold mb-4">A Journey Built on Faith</h3>
                <blockquote className="italic text-lg border-l-4 border-white pl-4">
                  "And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy. Indeed, in that are signs for a people who give thought." — <span className="font-semibold">Surah Ar-Rum (30:21)</span>
                </blockquote>
              </div>
            </div>
          </motion.div>
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
