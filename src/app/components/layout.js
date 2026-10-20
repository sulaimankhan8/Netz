'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import EditorialSidebar from './editorial/EditorialSidebar';
import NavBar from './NavBar';
import ProgressToast from './mascot/ProgressToast';
import CloudSync from './CloudSync';

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const shellRef = useRef(null);
  const pathname = usePathname();
  const isPlayground = pathname?.startsWith('/Playground');
  // A published note (/p/<slug>) is opened from a shared link: it has its own top bar, no app menus
  const isPublicNote = pathname?.startsWith('/p/');
  const showNavBar = isMobile && !isPlayground && !isPublicNote;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768 || window.innerHeight <= 500);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Full-screen pages (Notes) fit under the phone nav bar: its height is published as
  // --app-nav-h on the shell (0 when there is no bar)
  useEffect(() => {
    if (!showNavBar) {
      setNavHeight(0);
      return undefined;
    }
    const nav = shellRef.current?.querySelector('nav[data-app-nav]');
    if (!nav) return undefined;
    const measure = () => setNavHeight(Math.round(nav.getBoundingClientRect().height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [showNavBar]);

  return (
    <div
      ref={shellRef}
      className={`min-h-screen w-full relative flex ${showNavBar ? 'flex-col' : ''}`}
      style={{ '--app-nav-h': `${navHeight}px` }}
    >
      {!isMobile && !isPublicNote && <EditorialSidebar />}
      {/* Phones: the nav bar sits above the page, not beside it */}
      {showNavBar && <NavBar />}
      <div className={`flex-1 w-full min-w-0 ${showNavBar ? '' : 'min-h-screen'}`}>
        {children}
      </div>
      <ProgressToast />
      <CloudSync />
    </div>
  );
};

export default Layout;
