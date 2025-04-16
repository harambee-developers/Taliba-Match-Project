import React from 'react';

const Icon26 = ({ width = 24, height = 24, color = '#1a495d', className = 'object-contain' }) => {
  return (
    <svg 
      width={width}
      height={height}
      viewBox="441 217 141 141"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circle background */}
      <path 
        fill={color}
        d="M 511.9375 217.527344 C 473.050781 217.527344 441.527344 249.050781 441.527344 287.9375 C 441.527344 326.824219 473.050781 358.347656 511.9375 358.347656 C 550.824219 358.347656 582.347656 326.824219 582.347656 287.9375 C 582.347656 249.050781 550.824219 217.527344 511.9375 217.527344 Z"
        fillOpacity="1"
        fillRule="nonzero"
      />
      {/* Home icon */}
      <path 
        fill={color === "#FFF" ? "#E01D42" : "#FFF"}
        d="M 511.9375 245 L 471.527344 280 L 479.117188 280 L 479.117188 330 L 498.347656 330 L 498.347656 300 L 525.527344 300 L 525.527344 330 L 544.757812 330 L 544.757812 280 L 552.347656 280 L 511.9375 245 Z"
        fillOpacity="1"
        fillRule="nonzero"
      />
    </svg>
  );
};

export default Icon26; 