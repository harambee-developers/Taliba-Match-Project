import React, { useState, useEffect, useRef } from 'react';

export default function MessageBubble({
    msg,
    isMine,
    isFirstInRun,
    gender,
}) {

    const [showOptions, setShowOptions] = useState(false);
    const bubbleRef = useRef(null); // <- Step 1

    const handleDelete = () => {
        socket.emit("delete_message", {
            messageId: msg._id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
        });
        setShowOptions(false);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (bubbleRef.current && !bubbleRef.current.contains(e.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // choose background color
    const bgColorClass = isMine
        ? gender === "Male" ? "bg-[#203449]" : "bg-[#E01D42]"
        : gender === "Male" ? "bg-[#E01D42]" : "bg-[#203449]";

    const timestamp = new Date(msg.createdAt).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div
            style={{ "--bubble": bgColorClass.replace("bg-[", "").replace("]", "") }}
            ref={bubbleRef}
            className={`
                relative
                p-2
                max-w-xs md:max-w-md
                rounded-md shadow-md
                break-words 
                text-white
                ${bgColorClass}
                ${isFirstInRun ? (isMine ? "sender" : "receiver") : ""}
              `}
            onClick={() => setShowOptions((prev) => !prev)}
        >
            {msg.attachment ? (
                <div className="max-w-full w-full rounded-lg z-50">
                    {msg.attachment.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <a href={msg.attachment} target="_blank" rel="noopener noreferrer">
                            <img
                                src={msg.attachment}
                                alt="attachment"
                                className="w-full max-h-64 rounded-lg object-contain bg-white"
                            />
                        </a>
                    ) : msg.attachment.match(/\.(mp4|mov|webm|wmv)$/i) ? (
                        <video
                            controls
                            className="w-full max-h-64 rounded-lg object-contain"
                        >
                            <source src={msg.attachment} />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <a
                            href={msg.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-200 underline hover:text-blue-100"
                        >
                            View attachment
                        </a>
                    )}
                </div>
            ) : (
                <>
                    {msg.type === "deleted" ? (
                        <em className="text-gray-500">Message has been deleted</em>
                    ) : (
                        <>
                            <p className="text-sm font-semibold break-words pr-14">{msg.text}</p>
                            <span className="absolute bottom-1 right-2 text-xs text-white/70">
                                {timestamp}
                            </span>
                        </>
                    )}
                    {/* Dropdown for delete */}
                    {isMine && showOptions && msg.type !== "deleted" && (
                        <div className="absolute right-0 top-full mt-1 bg-white shadow-md rounded z-50 text-sm w-96">
                            <button
                                onClick={handleDelete}
                                className="flex px-4 py-2 text-red-500 hover:bg-gray-100 w-full text-left gap-2 hover:text-red-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6" />
                                </svg>
                                Delete Message
                            </button>
                        </div>
                    )}
                </>

            )}
        </div>
    );
}
