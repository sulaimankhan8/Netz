// src/app/components/NButton.js
'use client'; // Ensures this component is a client component

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function NButton({className, route, text, svgPath, width = 24, height = 24 }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(route); // Navigate to the provided route
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center px-6 py-3 text-white rounded-lg transition-all duration-300 ease-in-out
                 hover:bg-gray-600 focus:bg-gray-700 active:bg-gray-800 transform active:scale-95 ${className}`}
      style={{ backgroundColor: 'rgb(68, 72, 87)' }}
    >
      {svgPath && (
        <Image src={svgPath} alt="icon" width={width} height={height} className="mr-2" />
      )}
      {text}
    </button>
  );
}
