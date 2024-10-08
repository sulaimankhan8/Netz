// src/app/components/NButton.js
'use client'; // Ensures this component is a client component


import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import Image from 'next/image';

export default function NButton({
  className,
  route,
  text,
  svgPath,
  width = 24,
  height = 24,
  ariaLabel,
  isLoading = false,  // Loading state
  isDisabled = false, // Disabled state
}) {
  const router = useRouter();

  useEffect(() => {
    if (route) {
      router.prefetch(route);
    }
  }, [route, router]);
  const handleClick = () => {
    if (!isLoading && !isDisabled) {
      router.push(route); // Navigate to the provided route
    }
  };

  // Memoize button content and styles
  const buttonContent = useMemo(
    () => (
      <>
        {svgPath && (
          <Image src={svgPath} alt={text} width={width} height={height} className="mr-2" />
        )}
        {text}
      </>
    ),
    [svgPath, text, width, height]
  );

  const buttonClasses = useMemo(
    () =>
      `flex items-center px-6 py-3 text-white rounded-lg transition-all duration-300 ease-in-out 
      ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-600 focus:bg-gray-700 active:bg-gray-800 transform active:scale-95'}
      ${isLoading ? 'cursor-wait' : ''}
      ${className}`,
    [className, isDisabled, isLoading]
  );

  return (
    <button
      onClick={handleClick}
      className={buttonClasses}
      aria-label={ariaLabel || text} // Improved accessibility
      disabled={isDisabled || isLoading} // Disable when loading or explicitly disabled
      style={{ backgroundColor: 'rgb(68, 72, 87)' }}
    >
      {isLoading ? 'Loading...' : buttonContent}
    </button>
  );
}
