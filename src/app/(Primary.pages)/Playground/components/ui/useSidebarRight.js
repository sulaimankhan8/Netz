'use client';

import { useEffect, useState } from 'react';

/**
 * Where the app's left sidebar ends, in px from the left of the window (72 px collapsed, wider
 * when open). 0 on phones, where the sidebar is a sliding overlay that does not take room.
 * The dock, the top bars and the status area keep clear of it.
 */
export default function useSidebarRight() {
  const [sidebarRight, setSidebarRight] = useState(0);
  useEffect(() => {
    const sidebar = document.querySelector('[data-app-sidebar]');
    const measure = () => {
      const r = sidebar ? sidebar.getBoundingClientRect() : null;
      setSidebarRight(r && window.innerWidth >= 768 && r.right > 0 && r.width < window.innerWidth / 2 ? Math.round(r.right) : 0);
    };
    measure();
    const observer = sidebar && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (observer) observer.observe(sidebar);
    window.addEventListener('resize', measure);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);
  return sidebarRight;
}
