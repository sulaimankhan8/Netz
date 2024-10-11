'use client';
import { useEffect } from 'react';

const Ad = () => {
  useEffect(() => {
    // Ensure adsbygoogle script is loaded only on the client side
    if (typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, []);

  return (
    <>
      <ins className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3746721364737268"
        data-ad-slot="1328005139"
        data-ad-format="auto"
        data-full-width-responsive="true">
      </ins>
    </>
  );
};

export default Ad;
