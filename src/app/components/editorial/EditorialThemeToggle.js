'use client';

import React, { useState, useEffect } from 'react';

/**
 * EditorialThemeToggle - Animated Day & Night Switch, matte finish (flat colours, no glow or shine)
 * Features:
 * - Day Mode: Vibrant sky blue pill, glowing golden sun, drifting puffy white clouds (no moon/stars).
 * - Night Mode: Deep midnight celestial sky, cratered silver moon, twinkling stars (no sun/clouds).
 * - Smooth physics-based sliding and morphing transition.
 */
export default function EditorialThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  if (!mounted) {
    return <div className="w-[84px] h-[40px] rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />;
  }

  const isDay = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDay ? 'dark' : 'light'} mode`}
      className={`relative inline-flex items-center w-[84px] h-[40px] rounded-full p-1 cursor-pointer select-none transition-all duration-500 overflow-hidden border-2 group ${
        isDay
          ? 'bg-[#8fb2dc] border-[#6e93c2]'
          : 'bg-[#1d2330] border-[#3a4354]'
      } ${className}`}
    >
      {/* ================= BACKGROUND CELESTIAL ELEMENTS ================= */}
      
      {/* DAY ELEMENTS: Drifting Clouds (Only visible in Day) */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
          isDay ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {/* Cloud 1: a flat base with two bumps, one colour so it reads as one shape */}
        <div className="absolute left-[9px] bottom-[7px] w-[28px] h-[14px] animate-[cloud_6s_ease-in-out_infinite]">
          <div className="absolute left-0 bottom-0 w-[28px] h-[8px] rounded-full bg-[#eef2f6]" />
          <div className="absolute left-[4px] bottom-[2px] w-[10px] h-[10px] rounded-full bg-[#eef2f6]" />
          <div className="absolute left-[11px] bottom-[1px] w-[13px] h-[13px] rounded-full bg-[#eef2f6]" />
        </div>

        {/* Cloud 2: small, further back */}
        <div className="absolute left-[22px] top-[5px] w-[16px] h-[8px] opacity-60 animate-[cloud_9s_ease-in-out_infinite_reverse]">
          <div className="absolute left-0 bottom-0 w-[16px] h-[5px] rounded-full bg-[#eef2f6]" />
          <div className="absolute left-[4px] bottom-[1px] w-[8px] h-[7px] rounded-full bg-[#eef2f6]" />
        </div>
      </div>

      {/* NIGHT ELEMENTS: Twinkling Stars (Only visible at Night) */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
          !isDay ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
      >
        {/* Twinkling Star 1 */}
        <div className="absolute right-4 top-2 w-1.5 h-1.5 bg-[#d8dbe2] rounded-full animate-[twinkle_1.2s_ease-in-out_infinite]" />
        
        {/* Twinkling Star 2 */}
        <div className="absolute right-8 top-3.5 w-1 h-1 bg-[#e3dcc8] rounded-full animate-[twinkle_1.8s_ease-in-out_infinite_0.4s]" />
        
        {/* Twinkling Star 3 */}
        <div className="absolute right-3.5 bottom-2.5 w-1 h-1 bg-[#cdd5e3] rounded-full animate-[twinkle_1.4s_ease-in-out_infinite_0.8s]" />

        {/* Small Dim Star 4 */}
        <div className="absolute right-7 bottom-2 w-0.5 h-0.5 bg-neutral-300 rounded-full opacity-60" />
        
        {/* Constellation Cross Star */}
        <div className="absolute right-10 top-2 text-[8px] text-[#d8dbe2]/80 leading-none animate-[twinkle_2s_ease-in-out_infinite_0.2s]">
          ✦
        </div>
      </div>

      {/* ================= CELESTIAL ORB (SUN / MOON) ================= */}
      <div
        className={`relative z-10 w-7 h-7 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform flex items-center justify-center overflow-hidden ${
          isDay
            ? 'translate-x-[42px] bg-[#eec455] border border-[#d4a63a]'
            : 'translate-x-0 bg-[#c4c4ca] border border-[#9c9ca4]'
        }`}
      >
        {/* NIGHT MOON DETAILS: Realistic Craters */}
        <div 
          className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${
            !isDay ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Main Moon Shadow Inset */}
          <div className="absolute inset-0 rounded-full shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.1)]" />
          
          {/* Crater 1 (Top Left) */}
          <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#a3a3aa]" />
          
          {/* Crater 2 (Bottom Right) */}
          <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#a3a3aa]" />
          
          {/* Crater 3 (Tiny Center) */}
          <div className="absolute top-3.5 left-3 w-1 h-1 rounded-full bg-[#a3a3aa]" />
        </div>
      </div>
    </button>
  );
}
