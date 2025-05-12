import React from 'react';

const Icon52 = ({
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
      {/* chat bubble */}
      <path
        fill="var(--icon-fill)"
        d="
          M 480 250
          h 64
          a 8 8 0 0 1 8 8
          v 56
          a 8 8 0 0 1 -8 8
          H 522
          l -20 20
          v -20
          H 480
          a 8 8 0 0 1 -8 -8
          v -56
          a 8 8 0 0 1 8 -8
          Z
        "
        fillRule="nonzero"
      />
    </svg>
  </div>
);

export default Icon52;
