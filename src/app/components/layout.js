'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import EditorialSidebar from './editorial/EditorialSidebar';
import { PhoneTopBar, PhoneTabBar } from './PhoneNav';
import ProgressToast from './mascot/ProgressToast';
import CloudSync from './CloudSync';

/** Height of the element matching `selector` inside `root`, kept up to date (0 when absent or hidden). */
function useMeasuredHeight(rootRef, selector, enabled) {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setHeight(0);
      return undefined;
    }
    const el = rootRef.current?.querySelector(selector);
    if (!el) return undefined;
    const measure = () => setHeight(Math.round(el.getBoundingClientRect().height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootRef, selector, enabled]);
  return height;
}

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const shellRef = useRef(null);
  const pathname = usePathname();
  const isPlayground = pathname?.startsWith('/Playground');
  // A published note (/p/<slug>) is opened from a shared link: it has its own top bar, no app menus
  const isPublicNote = pathname?.startsWith('/p/');
  // Phones: a top bar (not on the Playground, which has its own page bar) and five buttons along the bottom
  const showTopBar = isMobile && !isPlayground && !isPublicNote;
  const showTabs = isMobile && !isPublicNote;
  // The side bar is fixed, so pages leave room for it. data-rail and --app-rail tell them whether it is there.
  const hasRail = !isMobile && !isPublicNote;

  useEffect(() => {
    const handleResize = () => {
      // Same cut-off as Tailwind's md (768px), which the pages use to leave room for the side bar
      setIsMobile(window.innerWidth < 768 || window.innerHeight <= 500);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Full-screen pages (Notes, Playground) fit between the phone bars: their heights are published
  // as --app-nav-h (top) and --app-tab-h (bottom) on the shell, 0 when there is no bar
  const navHeight = useMeasuredHeight(shellRef, '[data-app-nav]', showTopBar);
  const tabHeight = useMeasuredHeight(shellRef, 'nav[data-app-tabs]', showTabs);

  return (
    <div
      ref={shellRef}
      className={`min-h-screen w-full relative flex ${isMobile ? 'flex-col' : ''}`}
      data-rail={hasRail ? 'on' : 'off'}
      style={{ '--app-nav-h': `${navHeight}px`, '--app-tab-h': `${tabHeight}px`, '--app-rail': hasRail ? '72px' : '0px' }}
    >
      {!isMobile && !isPublicNote && <EditorialSidebar />}
      {showTopBar && <PhoneTopBar />}
      <div
        className={`flex-1 w-full min-w-0 ${isMobile ? '' : 'min-h-screen'}`}
        // Keeps the end of a page clear of the bottom buttons (the Playground fills the screen and needs none)
        style={showTabs && !isPlayground ? { paddingBottom: 'var(--app-tab-h, 0px)' } : undefined}
      >
        {children}
      </div>
      {showTabs && <PhoneTabBar />}
      <ProgressToast />
      <CloudSync />
    </div>
  );
};

export default Layout;
