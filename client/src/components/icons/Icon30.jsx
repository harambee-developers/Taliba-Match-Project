import React from 'react';

const Icon30 = ({
  width = 1366,
  height = 768,
  color = '#1a495d',
  className,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      viewBox="420 196 184 184"
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <path
        fill={color}
        d="M 511.996094 196.007812 C 562.589844 196.007812 603.984375 237.402344 603.984375 287.996094 C 603.984375 338.589844 562.589844 379.984375 511.996094 379.984375 C 461.402344 379.984375 420.007812 338.589844 420.007812 287.996094 C 420.007812 237.402344 461.402344 196.007812 511.996094 196.007812 Z"
        fillOpacity="1"
        fillRule="evenodd"
      />
      
      <path
        fill="#ffffff"
        d="M 455 265 L 569 265 C 571 265 573 267 573 269 L 573 313 C 573 315 571 317 569 317 L 455 317 C 453 317 451 315 451 313 L 451 269 C 451 267 453 265 455 265 Z M 458 273 L 566 273 L 566 309 L 458 309 L 458 273 Z M 466 283 L 558 283 L 558 288 L 466 288 Z M 466 293 L 558 293 L 558 298 L 466 298 Z"
        fillOpacity="1"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default Icon30; 