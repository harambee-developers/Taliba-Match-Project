import React, { useState, useEffect } from 'react';
import chat from '../assets/chat.png';
import logo from '../assets/logo.png';
import heart from '../assets/heart.png';
import puzzle from '../assets/puzzle.png';
import { useNavigate } from 'react-router-dom';

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

  usePageTitle("Welcome to Taliba Match!")

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
            onClick={() => { navigate("/register") }}>
            Get Started Now
          </button>
        </div>


        {/* Right Section (Blue) */}
        <div className="w-[85%] lg:w-[50%] bg-[#14485A] flex flex-col justify-center px-10 py-8 text-white relative mx-auto rounded-2xl lg:rounded-none mb-4 lg:mb-0 ">
          <div className="relative max-w-md mx-auto space-y-8">
            {[
              { icon: logo, title: "Create your profile" },
              { icon: puzzle, title: "Find your match" },
              { icon: chat, title: "Halal Conversation" },
              { icon: heart, title: "Marriage" },
            ].map((step, index) => (
              <div key={index} className="flex items-center space-x-6 relative">
                <div className="bg-white rounded-full flex items-center justify-center w-20 h-20">
                  <img
                    src={step.icon}
                    alt={step.title}
                    className="w-12 h-12 object-contain"
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
      <section className="w-[85%] lg:w-[100%] bg-gradient-to-r from-[#E01D42] to-[#990033] text-white py-16 px-6 md:px-12 lg:px-20 flex justify-center shadow-lg mx-auto rounded-2xl lg:rounded-none ">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          {/* Section Title */}
          <header>
            <h1 className="text-5xl font-extrabold tracking-wide mb-4">
              About Us
            </h1>
            <p className="text-lg lg:text-xl font-medium leading-relaxed">
              At Talibah Match, we believe marriage is more than a milestone—it’s a partnership designed to bring you closer to Allah and complete half your deen. Our mission is simple: to unite individuals striving for the same goal—seeking Allah’s pleasure through love, knowledge, and mutual support on the journey to Jannah.
            </p>
          </header>

          {/* Mission Statement */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-semibold mb-3">
                Who We Are
              </h2>
              <p className="text-lg lg:text-xl leading-relaxed">
                “Talibah” represents a seeker of knowledge, and at Talibah Match, we honor this identity by connecting individuals who prioritize the deen and the pursuit of sacred knowledge. Regardless of where you stand on your journey, whether you’re just beginning or are well-versed, this platform is for anyone with the shared ambition of striving towards faith, growth, and a fulfilling marriage.
              </p>
            </div>

            {/* Why Talibah Match */}
            <div>
              <h2 className="text-3xl font-semibold mb-3">
                Why Talibah Match?
              </h2>
              <p className="text-lg lg:text-xl leading-relaxed">
                In a world filled with distractions, Talibah Match is a place for those who value purpose-driven connections. With Allah’s permission, we strive to make the path of marriage easier for those who wish to find tranquility in a spouse who will not only share in their joy but also in their aspirations for the Hereafter. Our platform is rooted in sincerity, trust, and the belief that every believer deserves a partner who nurtures their iman, strengthens their character, and walks with them towards Jannah.
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

            {/* Vision */}
            {/* <div>
              <h2 className="text-3xl font-semibold mb-3">
                Our Vision
              </h2>
              <p className="text-lg lg:text-xl leading-relaxed">
                Talibah Match isn’t just about marriage; it’s about building a union that prioritizes spiritual growth, fosters a love for knowledge, and ensures that both partners remain steadfast in their deen. We are committed to helping you find a spouse who shares your values, supports your goals, and walks with you hand in hand toward the ultimate destination—Jannah.
              </p>
            </div> */}
          </div>

          {/* Closing Statement */}
          {/* <footer>
            <p className="text-lg lg:text-xl italic leading-relaxed font-medium">
              "Welcome to Talibah Match—where knowledge meets marriage."
            </p>
          </footer> */}
        </div>
      </section>

      {/* FAQ Section */}
      <div className="w-full p-8 bg-[#FFF1FE] mt-8">
        <h2 className="text-4xl font-bold text-[#E01D42] text-center mb-6 font-[Montserrat]">
          Commonly Asked Questions
        </h2>
        <div className="space-y-4 max-w-4xl mx-auto">
          {[
            {
              question: "How do we ensure halal conversation?",
              answer:
                "To maintain halal interactions, all conversations are monitored by both advanced AI technology and the Taalibah team. This ensures the prevention of khalwa (the seclusion of a man and woman) and safeguards Islamic guidelines.",
            },
            {
              question: "How does the process work?",
              answer:
                "Simply sign up and create your profile. Once registered, you will gain early access to browse other profiles on the site. When the platform fully launches, you can begin your journey to finding the ideal match.",
            },
            {
              question: "What are private profiles?",
              answer:
                "Private profiles allow you to maintain complete control over your visibility. By locking your profile, you can safeguard your privacy and choose the right moment to reveal your information to a suitable match.",
            },
            {
              question: "Why do we use Kunya’s?",
              answer:
                "A kunya is a personalised nickname created by you! It’s a thoughtful way to prioritise your privacy while fostering a comfortable user experience.",
            },
            {
              question: "How do we protect your privacy?",
              answer:
                "We prioritise your security by implementing robust encryption methods and cutting-edge security protocols to protect your personal details and interactions on our platform. Additionally, we are committed to transparency in data handling and adhere to the highest standards of compliance with data protection regulations.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-[#E01D42] border border-[#E01D42] text-white rounded-2xl"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left p-4 focus:outline-none flex justify-between items-center"
              >
                <span className="text-xl font-regular font-[Montserrat]">
                  {faq.question}
                </span>
                <span className="text-gray-300">
                  {openIndex === index ? "▲" : "▼"}
                </span>
              </button>
              {openIndex === index && (
                <div className="p-2 text-lg font-[Montserrat]">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
