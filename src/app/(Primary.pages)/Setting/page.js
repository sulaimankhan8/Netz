'use client';

import { useState, useEffect } from 'react';
import Tour from '../../components/tour/Tour';
import { 
  FaSun, 
  FaMoon, 
  FaSlidersH, 
  FaCheckCircle, 
  FaDesktop, 
  FaPalette,
  FaShieldAlt,
  FaBell
} from 'react-icons/fa';

export default function SettingsPage() {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    window.dispatchEvent(new Event('themeChange'));
    
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#191919] text-neutral-800 dark:text-neutral-200 font-sans pl-0 md:pl-[78px]">
        <div className="animate-pulse flex items-center space-x-2 text-sm font-semibold">
          <div className="w-4 h-4 rounded-full bg-neutral-400 dark:bg-neutral-600 animate-ping"></div>
          <span>Loading Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-[#141414] text-neutral-900 dark:text-neutral-100 font-sans pl-0 md:pl-[78px] transition-colors duration-200">
      <Tour ids={['settings']} />
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
              <FaSlidersH className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
              <span>Workspace Settings</span>
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Manage your global application theme and interface preferences.
            </p>
          </div>

          {savedToast && (
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3.5 py-2 rounded-xl animate-fadeIn">
              <FaCheckCircle className="w-4 h-4" />
              <span>Settings Saved!</span>
            </div>
          )}
        </div>

        {/* Global Theme Settings Section */}
        <section className="bg-white dark:bg-[#1c1c1c] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center space-x-3 text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <FaPalette className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Appearance & Global Theme</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Choose how NETZ looks across all pages and workspace sidebars.
              </p>
            </div>
          </div>

          {/* Theme Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2" data-tour="settings-theme">
            
            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`group relative p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                theme === 'light'
                  ? 'bg-white border-neutral-900 shadow-md ring-2 ring-neutral-900/10'
                  : 'bg-neutral-50 hover:bg-white border-neutral-200 dark:bg-[#222222] dark:hover:bg-[#282828] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <FaSun className="w-5 h-5" />
                </div>
                {theme === 'light' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-900 text-white">
                    Active
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-neutral-900">
                  Light Mode
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  Clean Notion-style white canvas with high contrast typography and neutral borders.
                </p>
              </div>
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`group relative p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                theme === 'dark'
                  ? 'bg-[#222222] border-white shadow-md ring-2 ring-white/10 text-white'
                  : 'bg-neutral-50 hover:bg-white border-neutral-200 dark:bg-[#222222] dark:hover:bg-[#282828] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FaMoon className="w-5 h-5" />
                </div>
                {theme === 'dark' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-neutral-900">
                    Active
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Dark Mode
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  Deep matte dark background with soft monochrome cards and low-glare contrast.
                </p>
              </div>
            </button>

          </div>
        </section>

        {/* Preferences Summary Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1c1c1c] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex items-start space-x-3">
            <FaDesktop className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Sun & Moon Quick Switch</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                The celestial toggle in the navigation bar also updates your global theme preference automatically.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1c1c1c] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex items-start space-x-3">
            <FaShieldAlt className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Persistent Storage</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Your theme selection is saved locally in your browser so your preference remains constant.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}