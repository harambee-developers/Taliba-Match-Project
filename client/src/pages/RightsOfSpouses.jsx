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

const ChapterDropdown = ({ title, sections }) => {
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
          {sections.map((section, idx) => (
            <SubDropdown key={idx} question={section.question} answer={section.answer} />
          ))}
        </div>
      </div>
    </div>
  );
};

const chapters = [
  {
    title: "Obligation of Nafaqah",
    sections: [
      {
        question: "What is the evidence for Nafaqah from the Qur'an and Sunnah?",
        answer: `The Prophet ﷺ said in a ḥadīth recorded in Ṣaḥīḥ Muslim (no. 1218):<br/><br/>
        "And their right upon you is that you provide for them and clothe them in kindness."<br/><br/>
        This shows that providing nafaqah is one of the wife's rights over her husband, and it must be done with goodness (bi'l-maʿrūf), meaning in a manner that is just, customary, and appropriate to one's financial ability.<br/><br/>
        Additionally, in the narration of Hind bint ʿUtbah, recorded in both Bukhārī and Muslim, as reported by ʿĀ'ishah (raḍiyallāhu ʿanhā):<br/><br/>
        Hind said, "O Messenger of Allah, indeed my husband is a stingy man. He does not give me what suffices me and my child. May I take from his wealth without his knowledge?"<br/>
        The Prophet ﷺ replied:<br/>
        "Take from his wealth what suffices you and your child, with fairness."<br/><br/>
        This clearly indicates that it is a woman's right to receive sufficient maintenance, and that this obligation falls upon the husband even if he is unwilling.`
      },
      {
        question: "When is Nafaqah obligatory?",
        answer: "Nafaqah becomes obligatory when the marriage contract is valid and the wife is obedient to her husband. It continues as long as the marriage is valid and the wife remains obedient."
      },
      {
        question: "How much Nafaqah should be provided?",
        answer: "The amount of nafaqah should be according to what is customary (maʿrūf) in the society, taking into account the husband's financial ability and the wife's social status."
      }
    ]
  },
  {
    title: "Nafaqah for the Wife's Maid",
    sections: [
      {
        question: "Is the husband obligated to provide for the wife's maid?",
        answer: "If the wife is accustomed to having a maid and it is within the husband's means, then yes, he is obligated to provide for the maid as part of the wife's maintenance."
      },
      {
        question: "How many maids should be provided?",
        answer: "The number of maids should be according to what is customary and within the husband's means. It is not a fixed number but depends on the social status and financial ability."
      }
    ]
  },
  {
    title: "Who is Entitled to Nafaqah?",
    sections: [
      {
        question: "What are the conditions for a wife to be entitled to Nafaqah?",
        answer: "A wife is entitled to nafaqah if she is obedient to her husband and fulfills her marital duties. The majority of scholars agree on this for the obedient wife."
      },
      {
        question: "What about the disobedient wife?",
        answer: "There is scholarly disagreement regarding the disobedient wife. Some scholars say she loses her right to nafaqah, while others maintain she still has the right to basic maintenance."
      }
    ]
  },
  {
    title: "Does a Woman Have to Cook and Clean?",
    sections: [
      {
        question: "What is the majority opinion regarding household duties?",
        answer: "The majority of scholars (Jumhūr) hold that cooking and cleaning are not obligatory upon the wife. These are considered acts of kindness and cooperation, not obligations."
      },
      {
        question: "What is the Ḥanafī opinion?",
        answer: "The Ḥanafī school holds that basic household duties are obligatory upon the wife, but this is a minority opinion."
      }
    ]
  },
  {
    title: "Mutual Intimacy: A Shared Right and Obligation",
    sections: [
      {
        question: "What are the mutual rights regarding intimacy?",
        answer: "Both spouses have the right to intimacy, and both have the obligation to fulfill each other's needs. It is not just the wife's responsibility, but a shared right and obligation."
      },
      {
        question: "What does the Sunnah say about marital relations?",
        answer: "The Prophet ﷺ emphasized the importance of treating one's spouse with kindness and fulfilling their rights. He warned against neglecting one's spouse and encouraged maintaining good relations."
      }
    ]
  },
  {
    title: "Justice Between Wives in Division of Time",
    sections: [
      {
        question: "What is the obligation regarding time division between wives?",
        answer: "A man with multiple wives must divide his time equally between them. This is an obligation from Allah and a right of the wives."
      },
      {
        question: "Does the initial stay with a new wife count against the others?",
        answer: "There is scholarly disagreement on this matter. Some say it counts, while others say it doesn't. The safer approach is to make up for any extra time spent with a new wife."
      }
    ]
  },
  {
    title: "Breastfeeding: Is It the Wife's Duty or the Husband's Expense?",
    sections: [
      {
        question: "What are the different scholarly opinions on breastfeeding?",
        answer: `There are three main opinions:<br/>
        1. The wife must breastfeed in all cases<br/>
        2. It is not obligatory at all<br/>
        3. It depends on social norms and context<br/><br/>
        The third opinion is the most balanced, taking into account the circumstances and social customs.`
      },
      {
        question: "Is a divorced woman obligated to breastfeed?",
        answer: "No, a divorced woman is not obligated to breastfeed. If she chooses to breastfeed, the father must provide her maintenance during the breastfeeding period."
      }
    ]
  },
  {
    title: "Who Has Custody After Divorce?",
    sections: [
      {
        question: "What is the ruling on custody of young children?",
        answer: `The majority of scholars hold that custody belongs to the mother if the husband divorces her and the child is still young and in need of care.<br/><br/>
        This is based on the statement of the Prophet ﷺ:<br/>
        "Whoever separates a mother from her child, Allah will separate him from his loved ones on the Day of Judgement."<br/>
        (Narrated by al-Tirmidhī and others)`
      },
      {
        question: "Does the mother lose custody if she remarries?",
        answer: "There is scholarly disagreement on this matter. Some say she loses custody, while others maintain she keeps it. The safer approach is to consider the best interests of the child."
      },
      {
        question: "What about custody after the child reaches the age of discernment?",
        answer: "After the age of discernment (usually around 7 years), the child may choose which parent to live with, taking into account their best interests."
      }
    ]
  }
];

const RightsOfSpouses = () => (
  <div className="min-h-screen theme-bg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 theme-btn-text">Rights of Husband and Wife</h1>
        <p className="text-lg max-w-3xl mx-auto theme-btn-text">
          A comprehensive guide to the rights and obligations of spouses in Islam, based on the Qur'an, Sunnah, and scholarly opinions.
        </p>
      </div>
      <div className="space-y-4">
        {chapters.map((chapter, idx) => (
          <ChapterDropdown key={idx} title={chapter.title} sections={chapter.sections} />
        ))}
      </div>
    </div>
  </div>
);

export default RightsOfSpouses; 