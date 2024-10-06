'use client';
import { useState, useEffect } from 'react';
import LottieAnimation from '@/app/components/Animation';
import Link from 'next/link';

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
    <div className="overflow-x-hidden transition-all duration-300 md:ml-[78px]  dark:bg-neutral-700 dark:text-white">
      <section className="h-[80vh] pt-7 p-15 text-center space-y-4  grid grid-cols-1 lg:grid-cols-2 md:w-[80%] w-[100%]   justify-center gap-20 ml-3px max-sm:px-1">
        {/* Conditional Rendering of Lottie Animation */}
        <div className="w-full h-auto mb-5 order-1 lg:order-1 mt-10 pt-10 max-sm:scale-75 ">
          {isMobile ? (
            <LottieAnimation src="/videos/construction-mobile.json" height={320} width={320} />
          ) : (
            <LottieAnimation src="/videos/construction-pc.json" height={500} width={700} />
          )}
        </div>

        {/* LinkedIn Contact Section */}
        <div className="mt-5 order-2 lg:order-none rounded-lg lg:bg-white lg:bg-opacity-10  max-lg:max-w-[50rem] mx-auto sm:px-5 py-">
          <p className="text-lg text-white p-5 m-auto">
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

          <div>
          <Link href="/newton-backward">Newton Backward</Link>
          </div>
          
        </div>
      </section>

      <section className="mt-[13rem] pt-5 bg-black/50">
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
