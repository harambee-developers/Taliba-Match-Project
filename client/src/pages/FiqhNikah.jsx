import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const SubDropdown = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-2 ml-2 border-l-4 theme-border bg-gray-50 rounded-lg shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-lg focus:outline-none"
      >
        <span className="font-semibold theme-btn-text text-left">{question}</span>
        <FaChevronDown
          className={`transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''} theme-btn-text`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-3 theme-btn-text" dangerouslySetInnerHTML={{ __html: answer }} />
      </div>
    </div>
  );
};

const ChapterDropdown = ({ title, faqs }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-4 border-l-8 theme-border bg-white rounded-lg shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 rounded-lg focus:outline-none"
        style={{ minHeight: 64 }}
      >
        <h2 className="text-xl font-bold theme-btn-text text-left">{title}</h2>
        <FaChevronDown
          className={`transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''} theme-btn-text`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 text-base">
          {faqs.map((faq, idx) => (
            <SubDropdown key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
};

const chapters = [
  {
    title: "What is Nikah",
    faqs: [
      { question: "What is the ruling of nikah?", answer: "Content coming soon." },
      { question: "What is the ruling of proposing to someone who has already been proposed to?", answer: "Content coming soon." },
      { question: "How long after the first marriage meeting should they get married?", answer: "According to the majority, marriage should take place once they have inclined to one another and are confident of compatibility." },
      { question: "What can the woman see of the man before marriage?", answer: "Content coming soon." },
      { question: "What can the man see of the woman before marriage?", answer: "Content coming soon." },
      { question: "Weak opinions on what can be shown", answer: "Content coming soon." },
    ]
  },
  {
    title: "The Conditions of Nikah",
    faqs: [
      { question: "First Condition — Wali", answer: "Content coming soon." },
      { question: "Who is the Wali?", answer: "Content coming soon." },
      { question: "Whose approval and consent is needed for a marriage?", answer: `The consent of the following individuals is needed:<ul><li>The bride</li><li>The groom</li><li>The <b>walī</b> (guardian) of the bride</li></ul>In the Ḥanafī madhhab, a marriage without a walī is valid. However, many of the Ḥanafī scholars either advise against it or agree with the other three madhhabs that it is invalid. Our advice is to take the more cautious view and to only proceed with the marriage with the presence of the walī.` },
      { question: "What are the conditions of the Wali?", answer: "Content coming soon." },
      { question: "Order of priority of the Wali - Ḥanafī Madhab", answer: "Content coming soon." },
      { question: "Order of priority of the Wali - Mālikī Madhab", answer: "Content coming soon." },
      { question: "Order of priority of the Wali - Shāfiʿī Madhab", answer: "Content coming soon." },
      { question: "Order of priority of the Wali - Ḥanbalī Madhab", answer: "Content coming soon." },
      { question: "Four important issues that must be discussed about guardianship at the time of marriage", answer: "Content coming soon." },
      { question: "What is ʿAḍl?", answer: "Content coming soon." },
      { question: "What constitutes suitability?", answer: "Content coming soon." },
      { question: "What Happens If the Walī Commits ʿAdl (Wrongful Prevention)?", answer: "Content coming soon." },
      { question: "Second Condition — Witnesses", answer: "Content coming soon." },
      { question: "Amount of Witnesses", answer: "Content coming soon." },
      { question: "Ruling on Secret Marriages", answer: "Content coming soon." },
      { question: "Do the witnesses have to be upright?", answer: "Content coming soon." },
      { question: "Third Condition — Mahr", answer: "Content coming soon." },
      { question: "Ruling on Mahr", answer: "Content coming soon." },
      { question: "Amount of Mahr", answer: "Content coming soon." },
      { question: "Does mahr have to be money?", answer: "Content coming soon." },
      { question: "For those who say there is a minimum, what is the amount?", answer: "Content coming soon." },
      { question: "Does the mahr have to be specified?", answer: "Content coming soon." },
      { question: "Can the mahr be delayed?", answer: "Content coming soon." },
      { question: "How long can the mahr be delayed for?", answer: "Content coming soon." },
      { question: "When does the full mahr become obligatory upon the husband?", answer: "Content coming soon." },
      { question: "What happens if the husband passes away before specifying the mahr and before consummation?", answer: "Content coming soon." },
      { question: "What types of mahr are not allowed?", answer: "Content coming soon." },
      { question: "Fourth Condition — No Barriers to Marriage", answer: "Content coming soon." },
      { question: "Two Types of Barriers", answer: "Content coming soon." },
      { question: "What Are the Permanent Barriers?", answer: "Content coming soon." },
      { question: "What Are the Non-Permanent Barriers?", answer: "Content coming soon." },
      { question: "Barrier Due to Familial Relations", answer: "Content coming soon." },
      { question: "Barrier Due to In-Law Relations", answer: "Content coming soon." },
      { question: "Barrier Due to Milk Relations (Raḍāʿah)", answer: "Content coming soon." },
      { question: "Up to what age can a child be breastfed for milk relations to be established?", answer: "Content coming soon." },
      { question: "If the child can eat solid foods before age two and is then breastfed by someone other than his mother, are milk relations established?", answer: "Content coming soon." },
      { question: "If the baby is fed from a milk bottle or the milk is poured into his mouth, does this establish milk relations?", answer: "Content coming soon." },
      { question: "If the milk is mixed with other substances, are milk relations established?", answer: "Content coming soon." },
      { question: "Does the husband of the milk mother become the milk father?", answer: "Content coming soon." },
      { question: "How many witnesses are needed to establish milk relations?", answer: "Content coming soon." },
      { question: "Barrier Due to Zinā (Fornication)", answer: "Content coming soon." },
      { question: "Barrier Due to Number", answer: "Content coming soon." },
      { question: "Barrier Due to Combining", answer: "Content coming soon." },
      { question: "Barrier Due to Disbelief", answer: "Content coming soon." },
      { question: "Barrier Due to Iḥrām (State of Pilgrimage)", answer: "Content coming soon." },
      { question: "Barrier Due to Illness", answer: "Content coming soon." },
      { question: "Barrier Due to ʿIddah", answer: "Content coming soon." },
    ]
  },
  {
    title: "Prohibited Marriages",
    faqs: [
      { question: "Types of Marriages That Are Prohibited", answer: "Content coming soon." },
      { question: "Shighār Marriage", answer: "Content coming soon." },
      { question: "Mutʿah Marriage", answer: "Content coming soon." },
      { question: "Marrying a Woman Who Is Already Engaged", answer: "Content coming soon." },
      { question: "Nikāḥ al-Muḥallil", answer: "Content coming soon." },
    ]
  },
  {
    title: "Stipulating Conditions in the Marriage Contract",
    faqs: [
      { question: "Stipulating Conditions in the Marriage Contract", answer: "Content coming soon." },
      { question: "View 1: The Conditions Are Binding", answer: "Content coming soon." },
      { question: "View 2: The Conditions Are Not Binding", answer: "Content coming soon." },
    ]
  },
  {
    title: "Invalid Marriages",
    faqs: [
      { question: "Invalid Marriages", answer: "Content coming soon." },
    ]
  },
];

const FiqhNikah = () => (
  <div className="min-h-screen theme-bg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 theme-btn-text">Fiqh of Nikah</h1>
        <p className="text-lg max-w-3xl mx-auto theme-btn-text">
          A summary of the main rulings and scholarly opinions on marriage (nikāḥ) in Islam, based on the four madhāhib.
        </p>
      </div>
      <div className="space-y-4">
        {chapters.map((chapter, idx) => (
          <ChapterDropdown key={idx} title={chapter.title} faqs={chapter.faqs} />
        ))}
      </div>
    </div>
  </div>
);

export default FiqhNikah; 