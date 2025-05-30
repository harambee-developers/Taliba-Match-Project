import React from 'react';

const ChatIcon = ({
    width = 150,
    height = 150,
    gender,
    className = '',
}) => (
    <div data-theme={gender}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 400 300"
            preserveAspectRatio="xMidYMid meet"
            className={className}
        >
            {/* Speech bubble outline */}
            <path
                fill="var(--bg-fill)"
                stroke="red"
                strokeWidth="4"
                d="M 10,70 Q 10,10 70,10 H 300 Q 360,10 360,70 V 180 Q 360,240 300,240 H 90 L 70,270 L 70,240 Q 10,240 10,180 Z"
            />

            {/* Top-left red rounded rectangle */}
            <rect
                x="20"
                y="0"
                width="100"
                height="60"
                rx="30"
                ry="30"
                fill="var(--icon-fill)"
            />

            {/* Three red dots */}
            <circle cx="120" cy="140" r="20" fill="var(--icon-fill)" />
            <circle cx="180" cy="140" r="20" fill="var(--icon-fill)" />
            <circle cx="240" cy="140" r="20" fill="var(--icon-fill)" />
        </svg>
    </div>
);

export default ChatIcon;
