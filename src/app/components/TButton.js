// components/TooltipButton.js
import { useState } from 'react';

const TButton = ({ tooltipText, onClick, imgSrc, altText, color , className ,type="button", float,}) => {
  const [hovered, setHovered] = useState(false);


  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event propagation
    onClick(); // Call the onClick function passed as a prop
};
  
  const colorClasses = (() => {
  
    switch (color) {
      case 'red':
        return 'bg-red-600 active:bg-red-600 focus:ring-red-700';
      case 'violet':
        return 'bg-violet-700 active:bg-violet-600 focus:ring-violet-700';
      case 'green':
        return 'bg-green-700 active:bg-green-600 focus:ring-green-700';
      case 'yellow':
        return 'bg-yellow-700 active:bg-yellow-600 focus:ring-yellow-700';
      case 'blue':
        return 'bg-blue-700 active:bg-blue-600 focus:ring-blue-700';
      default:
        return 'bg-gray-500 active:bg-gray-400 focus:ring-gray-500'; // Fallback color
    }
  })();
  return (
    <div className= {`relative inline-block ${float}`}>
      <button
        type={type}
        className={`text-white px-2 py-2 sm:px-4 rounded ${className} ${colorClasses} ${hovered ? 'opacity-75' : ''} focus:outline-none focus:ring-2 focus:ring-offset-2 active:bg-opacity-80 `}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
        
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