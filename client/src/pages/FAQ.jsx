import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-4 border-l-8 theme-border bg-white rounded-lg shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 rounded-lg focus:outline-none"
        style={{ minHeight: 64 }}
      >
        <h2 className="text-xl font-bold theme-btn-text text-left">{question}</h2>
        <FaChevronDown
          className={`transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''} theme-btn-text`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 text-base theme-btn-text">
          {answer}
        </div>
      </div>
    </div>
  );
};

const faqSections = [
  {
    section: "General Questions",
    faqs: [
      {
        question: "What is this website and who is it for?",
        answer: "This is an Islamic matrimony platform for practising Muslim men and women who are seeking nikāḥ through a serious, halal, and values-based process. It is built to support those who wish to marry for the sake of Allah."
      },
      {
        question: "Is this platform only for Muslims seeking marriage?",
        answer: "Yes. This platform is strictly for Muslims with sincere and halal intentions to pursue marriage."
      },
      {
        question: "Do I need to be practising to join?",
        answer: "Yes. While none of us is perfect, this platform is for those striving to live according to the Qur'an and Sunnah and seeking a spouse who shares that commitment."
      },
      {
        question: "Is this website available internationally?",
        answer: "Yes. Muslims from all over the world can join. You can filter by country."
      },
      {
        question: "Is there an age requirement to join?",
        answer: "Yes. You must be at least 18 years old and Islamically eligible to marry."
      },
    ]
  },
  {
    section: "Marriage Process",
    faqs: [
      {
        question: "How does this website help me find a spouse?",
        answer: "You create a profile, browse others based on your filters, and send a request to someone you're interested in. If they accept, a private chat opens. No one can message you unless you approve the connection."
      },
      {
        question: "Is this a matchmaking service or just a platform?",
        answer: "This is a self-guided platform that facilitates halal communication. We don't pair you manually, but provide structured tools and filters. You can also refer to our Islamic library for guidance on how to assess compatibility."
      },
      {
        question: "Can I involve my walī or guardian in the process?",
        answer: "Yes, and we encourage it. You can share your profile with your walī and invite them to oversee or participate in communication if desired."
      },
      {
        question: "Is this for first marriages only, or are divorced/widowed Muslims welcome too?",
        answer: "All Islamically eligible Muslims are welcome, including those who are divorced or widowed. Marital status should be stated clearly in the profile."
      },
      {
        question: "How do I know someone is serious about marriage?",
        answer: "The platform is designed for intentional, halal marriage seekers only. Communication begins only after mutual approval. We also provide resources in our library to help you ask the right questions."
      },
    ]
  },
  {
    section: "Islamic Guidelines",
    faqs: [
      {
        question: "Is this website Shariah-compliant?",
        answer: "Yes. Everything on this platform — from communication rules to privacy and modesty settings — is designed in line with Islamic ethics."
      },
      {
        question: "How do you ensure Islamic values are upheld here?",
        answer: "All conversations are monitored by both advanced AI technology and the Talibah team to prevent khalwa, safeguard modesty, and protect the serious intent of nikāḥ."
      },
      {
        question: "Can I search by madhhab?",
        answer: "Yes. You can use Islamic filters to find candidates."
      },
      {
        question: "Are male-female interactions monitored or restricted?",
        answer: "Yes. Conversations are only allowed after mutual acceptance, and all chats are monitored. Misuse of the platform leads to warnings or account suspension."
      },
      {
        question: "Do I have to upload a photo?",
        answer: "No. In fact, users cannot upload personal photos. You may only select from our avatars, in line with Islamic standards of modesty and privacy."
      },
      {
        question: "Why do you use kunyas?",
        answer: "We use kunyas (e.g., Umm Aaminah, Abu Salman) to maintain privacy and reinforce Islamic etiquette during interactions. Real names are only shared when users feel ready."
      },
      {
        question: "Can I share my profile with my guardian or imam?",
        answer: "Yes. Profiles can be shared easily with a walī, imam, or trusted family member."
      },
    ]
  },
  {
    section: "Privacy & Safety",
    faqs: [
      {
        question: "Is my personal information safe and private?",
        answer: "Yes. We use advanced encryption and security protocols to safeguard your profile, chat history, and all personal data."
      },
      {
        question: "Can I block or report someone?",
        answer: "Yes. You can block or report any user. The Talibah team reviews all reports seriously and takes swift action if Islamic boundaries are crossed."
      },
      {
        question: "Do you allow anonymous browsing?",
        answer: "No. Only logged-in, verified users can browse profiles to ensure safety and seriousness."
      },
      {
        question: "Can I delete my account anytime?",
        answer: "Yes. You can delete it entirely at any time from your settings."
      },
    ]
  },
  {
    section: "Communication",
    faqs: [
      {
        question: "How do I contact someone I'm interested in?",
        answer: "You first send a request. Only if the other person accepts can you begin messaging. This prevents unwanted messages and ensures mutual readiness."
      },
      {
        question: "Is there a chat or messaging system?",
        answer: "Yes. Once a connection is approved, a secure private chat opens. Conversations are monitored to ensure Islamic boundaries are maintained."
      },
      {
        question: "Can I include a third party or guardian in the conversation?",
        answer: "Yes. You can involve a guardian, imam, or trusted person at any time during your interaction."
      },
    ]
  },
  {
    section: "Contact",
    faqs: [
      {
        question: "How do I contact support?",
        answer: "You can email us at info@talibah.co.uk."
      }
    ]
  }
];

const FAQ = () => (
  <div className="min-h-screen theme-bg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 theme-btn-text">Frequently Asked Questions</h1>
        <p className="text-lg max-w-3xl mx-auto theme-btn-text">
          Find answers to common questions about our resources, platform, and Islamic guidance.
        </p>
      </div>
      <div className="space-y-8">
        {faqSections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-2xl font-bold mb-4 theme-btn-text">{section.section}</h2>
            <div className="space-y-4">
              {section.faqs.map((faq, j) => (
                <FAQItem key={j} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default FAQ; 