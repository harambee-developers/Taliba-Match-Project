import React from 'react';

const Icon30 = ({
  width = 24,
  height = 24,
  color = '#1a495d',
  className,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      viewBox="441 217 141 141"
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      {/* Circle background */}
      <path
        fill={color}
        d="M 511.9375 217.527344 C 473.050781 217.527344 441.527344 249.050781 441.527344 287.9375 C 441.527344 326.824219 473.050781 358.347656 511.9375 358.347656 C 550.824219 358.347656 582.347656 326.824219 582.347656 287.9375 C 582.347656 249.050781 550.824219 217.527344 511.9375 217.527344 Z"
        fillOpacity="1"
        fillRule="nonzero"
      />
      {/* White background for the book */}
      <rect
        x="472"
        y="250"
        width="80"
        height="75"
        rx="2"
        fill="#FFFFFF"
      />
      {/* Open book shape */}
      <path
        d="M 512 255 L 512 320 C 512 320 493 310 472 310 L 472 255 L 512 255 Z M 512 255 L 512 320 C 512 320 531 310 552 310 L 552 255 L 512 255 Z"
        fill={color}
      />
      {/* Book lines */}
      <path
        d="M 482 275 L 502 275 M 482 285 L 502 285 M 482 295 L 502 295 M 522 275 L 542 275 M 522 285 L 542 285 M 522 295 L 542 295"
        stroke="#FFFFFF"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
};

export default Icon30; 