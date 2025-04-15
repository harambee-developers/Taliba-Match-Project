const TypingIndicator = ({ isTyping, gender }) => {

  if (!isTyping) return null;

  return (
    <div className={`${gender === "Male" ? "bg-[#203449]" : "bg-[#E01D42]"} px-3 py-2 rounded-2xl flex items-center space-x-1 w-fit`}>
      <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></span>
      <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-300"></span>
    </div>
  );
};

export default TypingIndicator;
