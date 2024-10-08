'use client';
 import { useState, useEffect, useRef, useCallback } from "react";

const FullscreenToggle = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
 
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.error(err));
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && isFullscreen) {
      toggleFullscreen();
    }
  }, [isFullscreen, toggleFullscreen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  },[handleKeyDown]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = '';
    }
  }, [isFullscreen]);


  return (
    <div
      ref={containerRef}
      onDoubleClick={toggleFullscreen}
      className={`relative ${isFullscreen ? "fixed top-0 left-0 w-screen h-screen  overflow-auto z-50": ""} bg-white dark:bg-neutral-700`}
    >
      {children}
    </div>
  );
};

export default FullscreenToggle;
