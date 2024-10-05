'use client';
import { useState, useEffect } from 'react';
import LottieAnimation from '@/app/components/Animation';

const UnderConstruction = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is mobile
  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768); // Adjust breakpoint as needed
  };

  useEffect(() => {
    window.addEventListener('resize', checkMobile); // Update on resize
    checkMobile(); // Initial check

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className="overflow-x-hidden">
      <section className="h-[80vh] pt-7 p-5 text-center">
        {/* Conditional Rendering of Lottie Animation */}
        <div className="w-full h-auto mb-5">
          {isMobile ? (
            <LottieAnimation src="/videos/construction-mobile.json" height={300} width={300} />
          ) : (
            <LottieAnimation src="/videos/construction-pc.json" height={500} width={700} />
          )}
        </div>

        {/* LinkedIn Contact Section */}
        <div className="mt-5">
          <p className="text-lg text-white p-5">
            We&apos;re working hard to bring you an amazing experience! If you&apos;d like
            a specific page to be worked on first, feel free to contact me.
          </p>
          <a
            href="https://www.linkedin.com/in/suleman-khan-b4ab2b275/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-bold hover:underline"
          >
            Reach out to me on LinkedIn
          </a>
        </div>
      </section>

      <section className="md:mt-[15rem]">
        {/* Roadmap Section */}
        <h2
          className={`text-center text-xl text-white mb-5 font-bold px-7 `}
        >
          Here&apos;s a sneak peek at our roadmap! Scroll down to view the current
          progress of different sections and routes we&apos;re building.
        </h2>

        {/* Route Map Section */}
        <div >
          {/* Display Route Map SVG */}
          <img
            src="/Routes-map.svg"
            alt="Routes Map"
            className=" h-auto mx-auto sm:p-4 overflow-auto"
          />
        </div>
        
      </section>
    </div>
  );
};

export default UnderConstruction;
