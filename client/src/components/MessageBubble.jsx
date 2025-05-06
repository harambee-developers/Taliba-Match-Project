import React, { useState, useRef, useEffect } from 'react';

export default function MessageBubble({
    msg,
    isMine,
    isFirstInRun,
    gender,
}) {
    // New state to track whether the text is a single line or multi-line
    const [isSingleLine, setIsSingleLine] = useState(true);
    const messageTextRef = useRef(null);

    useEffect(() => {
        if (messageTextRef.current) {
            // Check if the text is overflowing (i.e., has multiple lines)
            setIsSingleLine(messageTextRef.current.scrollHeight <= messageTextRef.current.clientHeight);
        }
    }, [msg.text]); // Re-run this effect when the text changes

    // choose background color
    const bgColorClass = isMine
        ? gender === "Male" ? "bg-[#203449]" : "bg-[#E01D42]"
        : gender === "Male" ? "bg-[#E01D42]" : "bg-[#203449]";

    return (
        <div
            style={{ "--bubble": bgColorClass.replace("bg-[", "").replace("]", "") }}
            className={`
                relative
                max-w-xs md:max-w-md
                p-4 pb-6
                rounded-md 
                shadow-md
                break-words
                text-white
                ${bgColorClass}
                ${isFirstInRun ? (isMine ? "sender" : "receiver") : ""}
              `}
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
                <p
                    ref={messageTextRef}
                    className={`
                        font-semibold 
                        ${isSingleLine ? 'text-right' : 'absolute bottom-1 right-2 text-right'}
                    `}
                >
                    {msg.text}
                </p>
            )}
            {/* Time in bottom right */}
            <span className="absolute bottom-1 right-2 text-xs text-white/70">
                {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </span>
        </div>
    );
}
