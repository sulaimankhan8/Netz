// src/app/components/Ad.js
import { useEffect } from 'react';

const Ad = ({ onClose }) => {
  useEffect(() => {
    // Ensure the ad is only loaded if not already initialized
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('Ad failed to load:', e);
      }
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <button onClick={onClose} className="absolute top-4 right-4 text-white">Close</button>
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', height: '100%' }}
           data-ad-client="ca-pub-3746721364737268"
           data-ad-slot="1328005139"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

export default Ad;
