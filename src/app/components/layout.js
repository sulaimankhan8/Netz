'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import EditorialSidebar from './editorial/EditorialSidebar';
import NavBar from './NavBar';

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const isPlayground = pathname?.startsWith('/Playground');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768 || window.innerHeight <= 500);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen w-full relative flex">
      {!isMobile && <EditorialSidebar />}
      <div className="flex-1 w-full min-h-screen">
        {children}
      </div>
      {isMobile && !isPlayground && <NavBar />}
    </div>
  );
};

export default Layout;

