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
    // Rounded down: the bar overlaps the page by under a pixel instead of leaving a hairline gap
    const measure = () => setHeight(Math.floor(el.getBoundingClientRect().height));
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
  // Notes has its own title bar (and a back bar inside a note), so it skips the app's one too
  const isNotes = pathname?.startsWith('/Notes');
  const showTopBar = isMobile && !isPlayground && !isNotes && !isPublicNote;
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
      // 100dvh, not 100vh: on phones 100vh is the height with the address bar hidden, which made
      // full-screen pages (Notes) scroll by that much and show the page background below them
      className={`min-h-[100dvh] w-full relative flex ${isMobile ? 'flex-col' : ''}`}
      data-rail={hasRail ? 'on' : 'off'}
      style={{ '--app-nav-h': `${navHeight}px`, '--app-tab-h': `${tabHeight}px`, '--app-rail': hasRail ? '72px' : '0px' }}
    >
      {!isMobile && !isPublicNote && <EditorialSidebar />}
      {showTopBar && <PhoneTopBar />}
      <div
        // On phones nothing may push the page sideways: the fixed bottom buttons would be cut off
        className={`flex-1 w-full min-w-0 ${isMobile ? 'overflow-x-clip' : 'min-h-[100dvh]'}`}
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
