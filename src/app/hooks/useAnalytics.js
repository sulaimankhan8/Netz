// src/app/hooks/useAnalytics.js
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const useAnalytics = () => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', 'G-LQZ77XP63Z', {
          page_path: url,
        });
      }
    };

    // Listen to route changes
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      // Clean up the event listener on unmount
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
};

export default useAnalytics;
