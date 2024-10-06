'use client';

import { useEffect, useState } from 'react';
import Sidenav from './Sidenav';
import NavBar from './NavBar';

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isClosed, setIsClosed] = useState(false); // Manage sidebar toggle

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust based on your breakpoint
    };

    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`${!isMobile ? 'flex-col' : 'flex-row '}`}>
      {!isMobile && <Sidenav isClosed={isClosed} />} {/* Render sidebar only on larger screens */}
      <div className={`content ${isMobile ? 'w-full' : ' ml-80'}`}>
        {/* Apply margin based on the sidebar state */}
        {children}
      </div>
      {isMobile && <NavBar />} {/* Render navbar only on mobile */}
    </div>
  );
};

export default Layout;
