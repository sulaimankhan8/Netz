import Image from 'next/image';
import { useState } from 'react';


const TButton = ({ tooltipText, onClick, imgSrc, altText, color, className, type = "button", float }) => {
  const [hovered, setHovered] = useState(false);

  const handleClick = (e) => {
    onClick(); // Call the onClick function passed as a prop
  };

  const colorClasses = (() => {
    switch (color) {
      case 'red':
        return 'bg-red-600 shadow-red-500 hover:shadow-red-700 active:bg-red-600 focus:ring-red-700';
      case 'violet':
        return 'bg-violet-700 shadow-violet-500 hover:shadow-violet-700 active:bg-violet-600 focus:ring-violet-700';
      case 'green':
        return 'bg-green-700 shadow-green-500 hover:shadow-green-700 active:bg-green-600 focus:ring-green-700';
      case 'yellow':
        return 'bg-yellow-700 shadow-yellow-500 hover:shadow-yellow-700 active:bg-yellow-600 focus:ring-yellow-700';
      case 'blue':
        return 'bg-blue-700 shadow-blue-500 hover:shadow-blue-700 active:bg-blue-600 focus:ring-blue-700';
      default:
        return 'bg-gray-500 shadow-gray-500 hover:shadow-gray-700 active:bg-gray-400 focus:ring-gray-500'; // Fallback color
    }
  })();

  return (
    <div className={`relative inline-block ${float}`}>
      <button
        type={type}
        className={`text-white px-2 py-2 sm:px-5 rounded ${className} ${colorClasses} ${hovered ? 'opacity-75' : ''} focus:outline-none focus:ring-2 focus:ring-offset-2 active:bg-opacity-80 transition-shadow duration-200`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        {imgSrc ? (
          <Image src={imgSrc} alt={altText} width={24} height={24} className="ml-2"/>
        ) : (
          <span>{altText}</span>
        )}
      </button>
      {hovered && tooltipText && (
        <div className="absolute overflow-visible bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-white text-sm rounded shadow-lg">
          {tooltipText}
        </div>
      )}
    </div>
  );
};

export default TButton;
