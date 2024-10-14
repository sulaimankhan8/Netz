'use client';
import { useState, useEffect } from 'react';
import LottieAnimation from '@/app/components/Animation';
import Link from 'next/link';
import Image from 'next/image';

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
    <div className='w-full bg-center top-0'>
      <div className='grid grid-rows-1 gap-52'>
        <div className="transition-all duration-300 dark:bg-neutral-700 dark:text-white w-full">
          <div className="h-[80vh] text-center space-y-4 grid grid-cols-1 lg:grid-cols-2 md:w-[80%] w-[100%] justify-center gap-20 max-sm:px-1 mx-auto">
            <div className="w-full h-auto order-1 lg:order-1 mt-10 pt-10 max-sm:scale-75">
              {isMobile ? (
                <LottieAnimation src="/videos/construction-mobile.json" height={320} width={320} />
              ) : (
                <LottieAnimation src="/videos/construction-mobile.json" height={500} width={500} />
              )}
            </div>

            {/* LinkedIn Contact div */}
            <div className="lg:mt-5 order-2 lg:order-none rounded-lg lg:bg-white lg:bg-opacity-10 max-lg:max-w-[50rem] mx-auto sm:px-5 pt-10">
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
                <Link href="/newton-backward" className="text-white hover:underline">Newton Backward</Link>
              </div>
            </div>
          </div>
        </div>

        <div className='grid-rows-2'>
          <div className="mt-[13rem] pt-5 bg-black/50 ml-[80px] mr-5">
            {/* Roadmap div */}
            <h2 className="text-center text-xl text-white mb-5 font-bold px-7">
              Here&apos;s a sneak peek at our roadmap! Scroll down to view the current
              progress of different sections and routes we&apos;re building.
            </h2>

            {/* Route Map div */}
            <div>
              {/* Display Route Map SVG */}
              <Image
                src="/Routes-map.svg"
                alt="Routes Map"
                className="h-auto mx-auto sm:p-4 overflow-auto"
                width={1600}
                height={1600}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
