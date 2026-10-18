'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  resolvedMode: 'light',
  setTheme: () => {},
  toggleLightDark: () => {},
});

export const THEME_OPTIONS = [
  {
    id: 'light',
    name: 'Light Classic',
    description: 'Clean alabaster daytime style with crisp contrast',
    mode: 'light',
    palette: ['#FFFFFF', '#F3F4F6', '#3B82F6', '#111827'],
  },
  {
    id: 'dark',
    name: 'Dark Midnight',
    description: 'Deep obsidian night workspace for dark environment',
    mode: 'dark',
    palette: ['#121212', '#1E1E1E', '#3B82F6', '#F9FAFB'],
  },
  {
    id: 'system',
    name: 'System Preference',
    description: 'Automatically synchronizes with your device OS settings',
    mode: 'system',
    palette: ['#6B7280', '#9CA3AF', '#3B82F6', '#F3F4F6'],
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    description: 'Lush mint & deep emerald dark theme for high readability',
    mode: 'dark',
    palette: ['#062016', '#0B2E21', '#10B981', '#ECFDF5'],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Vibrant neon dark theme with electric cyan & magenta accents',
    mode: 'dark',
    palette: ['#0F081D', '#1A0C31', '#EC4899', '#06B6D4'],
  },
  {
    id: 'sepia',
    name: 'Warm Sepia',
    description: 'Soft warm paper retro tone for comfortable long reading',
    mode: 'light',
    palette: ['#F7F1E3', '#EDE4D1', '#D97706', '#432818'],
  },
  {
    id: 'nord',
    name: 'Nord Oceanic',
    description: 'Arctic slate blue palette with icy cyan highlights',
    mode: 'dark',
    palette: ['#1E2736', '#283446', '#38BDF8', '#F1F5F9'],
  },
  {
    id: 'sunset',
    name: 'Sunset Horizon',
    description: 'Warm dusk twilight dark theme with coral sunset glow',
    mode: 'dark',
    palette: ['#1C1326', '#2A1B3D', '#F97316', '#FDA4AF'],
  },
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');
  const [resolvedMode, setResolvedMode] = useState('light');
  const [mounted, setMounted] = useState(false);

  const applyThemeToDOM = useCallback((themeId) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    let mode = 'light';

    if (themeId === 'system') {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      const selected = THEME_OPTIONS.find((t) => t.id === themeId);
      mode = selected ? selected.mode : 'light';
    }

    setResolvedMode(mode);

    // Toggle .dark class on html/document element
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update data-theme attribute
    root.setAttribute('data-theme', themeId);
  }, []);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('netz_theme') || localStorage.getItem('theme') || 'dark';
    setThemeState(saved);
    applyThemeToDOM(saved);

    // System theme change listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const current = localStorage.getItem('netz_theme') || 'light';
      if (current === 'system') {
        applyThemeToDOM('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [applyThemeToDOM]);

  const setTheme = useCallback(
    (newTheme) => {
      setThemeState(newTheme);
      localStorage.setItem('netz_theme', newTheme);
      const selMode = THEME_OPTIONS.find((t) => t.id === newTheme)?.mode || 'light';
      localStorage.setItem('theme', newTheme === 'system' ? resolvedMode : selMode);
      applyThemeToDOM(newTheme);
    },
    [applyThemeToDOM, resolvedMode]
  );

  const toggleLightDark = useCallback(() => {
    const nextMode = resolvedMode === 'light' ? 'dark' : 'light';
    setTheme(nextMode);
  }, [resolvedMode, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedMode,
        setTheme,
        toggleLightDark,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
