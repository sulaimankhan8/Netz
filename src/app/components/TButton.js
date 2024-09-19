// components/TooltipButton.js
import { useState } from 'react';

const TButton = ({ tooltipText, onClick, imgSrc, altText, color = "#0000FF", className ,type="button", float}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className= {`relative inline-block ${float}`}>
      <button
        type={type}
        className={`text-white px-2 py-2 sm:px-4 rounded ${className} ${hovered ? 'opacity-75' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        style={{ backgroundColor: color }}
      >
        {imgSrc ? (
          <img src={imgSrc} alt={altText} />
        ) : (
          <span>{altText}</span>
        )}
      </button>
      {hovered && tooltipText && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-white text-sm rounded shadow-lg">
          {tooltipText}
        </div>
      )}
    </div>
  );
};

export default TButton;
