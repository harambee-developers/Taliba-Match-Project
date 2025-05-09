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

    const timestamp = new Date(msg.createdAt).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div
            style={{ "--bubble": bgColorClass.replace("bg-[", "").replace("]", "") }}
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
                    <p className="text-sm font-semibold break-words pr-14">{msg.text}</p>
                    <span className="absolute bottom-1 right-2 text-xs text-white/70">
                        {timestamp}
                    </span>

                </>
            )}
        </div>
    );
}
