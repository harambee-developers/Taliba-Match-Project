import React from 'react';

const Icon51 = ({
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
            viewBox="437 213 150 150"
            preserveAspectRatio="xMidYMid meet"
            className={className}
        >
            {/* rounded background */}
            <path
                fill="var(--bg-fill)"
                d="
          M 512 213.195312
          C 470.757812 213.195312 437.195312 246.757812 437.195312 288
          C 437.195312 329.242188 470.757812 362.804688 512 362.804688
          C 553.242188 362.804688 586.804688 329.242188 586.804688 288
          C 586.804688 246.757812 553.242188 213.195312 512 213.195312 Z
        "
            />

            {/* heart icon, centered & scaled to fill the circle */}
            <g transform="translate(446 221) scale(5.5)">
                <path
                    fill="var(--icon-fill)"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
           C2 5.42 4.42 3 7.5 3
           c1.74 0 3.41.81 4.5 2.09
           C13.09 3.81 14.76 3 16.5 3
           C19.58 3 22 5.42 22 8.5
           c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
            </g>
        </svg>
    </div>
);

export default Icon51;
