'use client';

import React, { useState, useEffect } from 'react';

/**
 * EditorialThemeToggle - Animated Celestial Day & Night Switch
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
      className={`relative inline-flex items-center w-[84px] h-[40px] rounded-full p-1 cursor-pointer select-none transition-all duration-500 overflow-hidden border-2 shadow-inner group ${
        isDay 
          ? 'bg-gradient-to-r from-[#70a5f9] to-[#93c5fd] border-[#3b82f6] shadow-blue-300/40' 
          : 'bg-gradient-to-r from-[#0f172a] to-[#1e293b] border-[#475569] shadow-black/60'
      } ${className}`}
    >
      {/* ================= BACKGROUND CELESTIAL ELEMENTS ================= */}
      
      {/* DAY ELEMENTS: Drifting Clouds (Only visible in Day) */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
          isDay ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {/* Cloud 1 */}
        <div className="absolute left-2.5 bottom-1.5 flex items-end animate-[cloud_6s_ease-in-out_infinite]">
          <div className="w-3.5 h-3.5 rounded-full bg-white/90 shadow-sm" />
          <div className="w-5 h-4.5 -ml-1.5 rounded-full bg-white shadow-sm" />
          <div className="w-3 h-3 -ml-1 rounded-full bg-white/90 shadow-sm" />
        </div>

        {/* Cloud 2 (Small backdrop cloud) */}
        <div className="absolute left-8 top-1.5 flex items-end opacity-70 animate-[cloud_9s_ease-in-out_infinite_reverse]">
          <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
          <div className="w-3.5 h-3 -ml-1 rounded-full bg-white/90" />
        </div>
      </div>

      {/* NIGHT ELEMENTS: Twinkling Stars (Only visible at Night) */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
          !isDay ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
      >
        {/* Twinkling Star 1 */}
        <div className="absolute right-4 top-2 w-1.5 h-1.5 bg-white rounded-full animate-[twinkle_1.2s_ease-in-out_infinite] shadow-[0_0_4px_#fff]" />
        
        {/* Twinkling Star 2 */}
        <div className="absolute right-8 top-3.5 w-1 h-1 bg-amber-100 rounded-full animate-[twinkle_1.8s_ease-in-out_infinite_0.4s] shadow-[0_0_3px_#fff]" />
        
        {/* Twinkling Star 3 */}
        <div className="absolute right-3.5 bottom-2.5 w-1 h-1 bg-blue-100 rounded-full animate-[twinkle_1.4s_ease-in-out_infinite_0.8s] shadow-[0_0_3px_#fff]" />

        {/* Small Dim Star 4 */}
        <div className="absolute right-7 bottom-2 w-0.5 h-0.5 bg-neutral-300 rounded-full opacity-60" />
        
        {/* Constellation Cross Star */}
        <div className="absolute right-10 top-2 text-[8px] text-white/90 leading-none animate-[twinkle_2s_ease-in-out_infinite_0.2s]">
          ✦
        </div>
      </div>

      {/* ================= CELESTIAL ORB (SUN / MOON) ================= */}
      <div
        className={`relative z-10 w-7 h-7 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform flex items-center justify-center overflow-hidden ${
          isDay
            ? 'translate-x-[42px] bg-gradient-to-br from-[#fde047] to-[#eab308] shadow-[0_0_12px_rgba(250,204,21,0.9)] border border-amber-200'
            : 'translate-x-0 bg-gradient-to-br from-[#e4e4e7] to-[#a1a1aa] shadow-[0_0_10px_rgba(228,228,231,0.4)] border border-neutral-400'
        }`}
      >
        {/* DAY SUN DETAILS: Solar Ray Glow & Flare */}
        <div 
          className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
            isDay ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-yellow-200 rounded-full" />
          <div className="absolute inset-0.5 rounded-full border border-yellow-100/60" />
        </div>

        {/* NIGHT MOON DETAILS: Realistic Craters */}
        <div 
          className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${
            !isDay ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Main Moon Shadow Inset */}
          <div className="absolute inset-0 rounded-full shadow-[inset_-3px_-2px_4px_rgba(0,0,0,0.35)]" />
          
          {/* Crater 1 (Top Left) */}
          <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#71717a]/50 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" />
          
          {/* Crater 2 (Bottom Right) */}
          <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#71717a]/50 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" />
          
          {/* Crater 3 (Tiny Center) */}
          <div className="absolute top-3.5 left-3 w-1 h-1 rounded-full bg-[#71717a]/40 shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.4)]" />
        </div>
      </div>
    </button>
  );
}
