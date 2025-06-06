import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const QuestionCategory = ({ title, questions }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 border-l-8 theme-border bg-white rounded-lg shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 rounded-lg focus:outline-none"
        style={{ minHeight: 64 }}
      >
        <h2 className="text-2xl font-bold theme-btn-text">{title}</h2>
        <FaChevronDown 
          className={`transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''} theme-btn-text`}
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 space-y-4">
          {questions.map((question, index) => (
            <div 
              key={index} 
              className="p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:translate-x-2 bg-gray-50"
            >
              <p className="theme-btn-text">{question}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Questions = () => {
  const categories = [
    {
      title: "General Self-Knowledge & Personality",
      questions: [
        "Why are you seeking marriage at this point in your life?",
        "What are your personal strengths and weaknesses?",
        "What habits are you actively trying to improve?",
        "What would your closest friends say about you?",
        "What have you learned from your past relationships (family)?",
        "What is your biggest regret, and what did you learn from it?",
        "What are your top three life priorities right now?",
        "Describe an experience that changed your worldview.",
        "How do you respond to failure or criticism?",
        "How do you typically manage stress or anxiety?",
        "What do you fear most about marriage?",
        "What are qualities you most value in a spouse?"
      ]
    },
    {
      title: "Islamic Beliefs & Practice",
      questions: [
        "How do you increase your connection with Allah on a daily basis?",
        "Do you adhere to a specific madhhab or approach to fiqh?",
        "What are your views on following a scholar vs. personal ijtihad?",
        "Are you consistent with your five daily prayers? How about Sunnah prayers?",
        "Do you fast voluntary fasts like Mondays/Thursdays or Ayyām al-Bīḍ?",
        "Have you performed Hajj or ʿUmrah? Do you intend to go soon?",
        "What are your views on celebrating religious days like Mawlid?",
        "Do you actively seek Islamic knowledge? Through classes, books, scholars?",
        "Do you pay zakat and give regular sadaqah? How much and to whom?",
        "What is your position on listening to music, watching movies, or attending mixed events?",
        "What is your opinion on bidʿah (innovation)? Where do you draw the line?",
        "What are your views on daʿwah? Would you like your household to be involved?",
        "What role should Islam play in every decision a couple makes?"
      ]
    },
    {
      title: "Understanding of Marriage & Roles",
      questions: [
        "What is the main purpose of marriage in Islam?",
        "What are the rights and duties of a husband? Of a wife?",
        "What is your opinion on the concept of qiwāmah (male guardianship)?",
        "What are your expectations of a 'good wife' or 'good husband'?",
        "What is your approach to leadership, decision-making, and consultation in the home?",
        "Would you be comfortable if your spouse earned more than you?",
        "How do you feel about gender roles in the home (e.g. cooking, cleaning)?",
        "Would you ever consider polygyny (or accept your husband taking another wife)?",
        "How do you want to be supported when you're emotionally down?"
      ]
    },
    {
      title: "Communication & Conflict",
      questions: [
        "How do you prefer to express your thoughts — verbally, written, or non-verbal?",
        "How do you handle arguments or tension?",
        "What are your communication pet peeves?",
        "How often do you like to talk about emotions or deep topics?",
        "What's your strategy for conflict resolution?",
        "Do you believe in open discussion, silent cooling off, or third-party mediation?",
        "How do you apologise when you're wrong?",
        "What do you expect from your spouse when you're upset?",
        "Would you consider Islamic marriage counselling if needed?",
        "What is your view on arbitration in case of major marital disputes?"
      ]
    },
    {
      title: "Family & In-Laws",
      questions: [
        "What is your relationship like with your family?",
        "How do you prioritise spouse vs. parents in decision-making?",
        "Are you open to living with your in-laws short-term or long-term?",
        "How often do you think couples should visit extended family?",
        "What role should family play in childrearing or financial decisions?",
        "How should disagreements between in-laws and spouses be handled?",
        "Would you be willing to relocate to care for elderly parents?",
        "How do you handle cultural clashes between families?",
        "Have your parents placed any non-negotiable conditions for your marriage?"
      ]
    },
    {
      title: "Career, Education & Ambitions",
      questions: [
        "What is your current profession and long-term career goal?",
        "Do you plan to pursue further education or qualifications?",
        "Do you expect your spouse to work or stay at home?",
        "If your spouse wanted to work/study full-time, would you support them?",
        "How do you define work-life balance?",
        "Are you open to changing your career path in the future?",
        "Would you move cities or countries for better work/study opportunities?",
        "Do you plan to start a business or own property?",
        "What role does ambition or professional success play in your life?",
        "Would you be okay with being the sole breadwinner for some time?"
      ]
    },
    {
      title: "Finances & Lifestyle",
      questions: [
        "What is your understanding of the man's obligation to provide nafaqah?",
        "Do you budget and save? How do you track spending?",
        "Do you have any debts? If so, how do you plan to manage them?",
        "Should spouses have joint accounts, separate accounts, or both?",
        "What is your approach to zakat, sadaqah, and charitable spending?",
        "How much should be spent without needing to consult your spouse?",
        "Are you okay with a modest lifestyle if needed?",
        "How do you approach financial risk-taking (investments, business)?",
        "How much mahr do you expect or are you offering? What type?",
        "What lifestyle do you envision for your family (modest, middle class, luxury)?"
      ]
    },
    {
      title: "Children & Parenting",
      questions: [
        "Do you want children? How many ideally?",
        "How soon after marriage would you want to start a family?",
        "How should household responsibilities change during pregnancy?",
        "Would you consider fertility treatments if you struggled to conceive?",
        "What would you do if one of you was unable to have children?",
        "What parenting style do you favour (authoritative, gentle, structured)?",
        "What's your view on disciplining children (time-outs, smacking, etc.)?",
        "What language(s) do you want your children to speak?",
        "Do you prefer homeschooling, Islamic schools, or mainstream schools?",
        "How involved should both parents be in day-to-day parenting?",
        "Would you send your children abroad for studies?",
        "What if your child chooses a different Islamic opinion or madhhab?"
      ]
    },
    {
      title: "Daily Routine, Home & Personal Habits",
      questions: [
        "Are you an early riser or a night owl?",
        "Do you like to follow a fixed routine or go with the flow?",
        "How tidy or clean are you at home? Do you expect the same?",
        "Who is responsible for cooking, cleaning, grocery shopping?",
        "How do you manage home chores when both spouses work?",
        "What is your approach to time management?",
        "How do you spend your weekends or days off?",
        "Are you okay with guests visiting frequently?",
        "Do you enjoy hosting Islamic gatherings at home?",
        "How do you feel about pets?",
        "Do you smoke or vape? What are your views on it?"
      ]
    },
    {
      title: "Social Life, Friendships & Media",
      questions: [
        "How often do you like socialising with friends?",
        "What is your view on mixed gatherings or weddings?",
        "Do you think spouses should have friends of the opposite gender?",
        "How much time should couples spend alone together vs. socially?",
        "What is your relationship with your phone and social media?",
        "Are you okay with your spouse posting on Instagram or TikTok?",
        "Do you follow influencers or Islamic accounts regularly?",
        "Do you listen to podcasts or watch Islamic lectures?",
        "Do you play video games or binge-watch series?",
        "Do you believe in having 'me-time' or do everything together?"
      ]
    },
    {
      title: "Location & Future Plans",
      questions: [
        "Where do you currently live and why?",
        "Do you plan to relocate for better job/Islamic environment?",
        "Would you consider hijrah to a Muslim country?",
        "Do you prefer city life, suburb, or rural?",
        "Is living close to family important to you?",
        "Would you be open to moving abroad with your spouse?",
        "How important is it to live near a strong Muslim community?",
        "What are your thoughts on buying a home vs renting?",
        "Where do you see yourself in 5, 10, 20 years?"
      ]
    },
    {
      title: "Culture, Ethnicity & Language",
      questions: [
        "How important is cultural compatibility to you?",
        "Are there cultural expectations you want to preserve (e.g. food, events)?",
        "Are you open to marrying someone from a different ethnicity?",
        "What language(s) do you speak? Which ones would you want your kids to speak?",
        "How do you handle cultural differences between families?",
        "Are you willing to learn about your spouse's culture and traditions?"
      ]
    },
    {
      title: "Monogamy & Trust",
      questions: [
        "What are your views on trust, privacy, and honesty in marriage?",
        "Do you think spouses should share passwords or keep separate devices?",
        "Would you be open to polygyny? Under what conditions?",
        "What are your views on jealousy and protectiveness?"
      ]
    },
    {
      title: "Final Decision-Making & Preparation",
      questions: [
        "What is your process for making big decisions (e.g. istikhārah, consulting)?",
        "What role do parents/family play in your marriage decision?",
        "How will you know this person is the right one?",
        "What would you want to happen in a disagreement about proceeding?",
        "Are you ready to commit soon, or need more time?",
        "Have you taken a marriage course or studied fiqh of marriage?",
        "Are you comfortable signing a marriage contract with clear conditions?"
      ]
    }
  ];

  return (
    <div className="min-h-screen theme-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 theme-btn-text">Questions to Ask Your Spouse</h1>
          <p className="text-lg max-w-3xl mx-auto theme-btn-text">
            A comprehensive guide to help you get to know your potential spouse better. 
            These questions cover various aspects of life and can help you make an informed decision about marriage.
          </p>
        </div>
        <div className="space-y-4">
          {categories.map((category, index) => (
            <QuestionCategory
              key={index}
              title={category.title}
              questions={category.questions}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Questions; 