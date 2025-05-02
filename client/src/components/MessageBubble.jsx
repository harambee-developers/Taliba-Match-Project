// src/components/MessageBubble.jsx
import React from 'react';

export default function MessageBubble({
    msg,
    isMine,
    isFirstInRun,
    gender,
}) {

    // choose background color
    const bgColorClass = isMine
        ? gender === "Male" ? "bg-[#203449]" : "bg-[#E01D42]"
        : gender === "Male" ? "bg-[#E01D42]" : "bg-[#203449]";

    // Determine attachment emoji
    const renderAttachmentIcon = () => {
        if (!msg.attachment) return null;
        // 📎 for generic attachments, 🖼️ for images, 📹 for videos
        if (msg.attachment.match(/\.(jpeg|jpg|gif|png|webp)$/i)) return '🖼️';
        if (msg.attachment.match(/\.(mp4|mov|webm|wmv)$/i)) return '📹';
        return '📎';
    };

    return (
        <div
            style={{ "--bubble": bgColorClass.replace("bg-[", "").replace("]", "") }}
            className={`
                relative
                max-w-xs md:max-w-md
                p-4
                rounded-lg 
                shadow-md
                break-words
                text-white
                ${bgColorClass}
                ${isFirstInRun ? (isMine ? "sender" : "receiver") : ""}
              `}
        >
            {/* attachment emoji/icon */}
            {msg.attachment && (
                <span className="text-xl mr-2 inline-block" aria-label="Attachment Icon" role="img">
                    {renderAttachmentIcon()}
                </span>
            )}
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
                <p className="font-semibold">{msg.text}</p>
            )}
        </div>
    );
}
