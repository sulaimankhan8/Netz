'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdSlot from './ads/AdSlot';
import { METHODS, unitById } from './algorithms/catalog';

// Derived from the one catalog (components/algorithms/catalog.js) so units and order can't drift.
// The method pages now show previous/next in MethodShell; this component is kept for old imports.
export const ALGORITHMS_REGISTRY = METHODS.map((m) => ({ title: m.name, path: m.route, unit: `Unit ${unitById(m.unit).num}` }));

export default function AlgorithmNavigation({ currentPath: overridePath }) {
  const pathname = usePathname();
  const currentPath = overridePath || pathname;

  const currentIndex = ALGORITHMS_REGISTRY.findIndex(
    (algo) => algo.path.toLowerCase() === (currentPath || '').toLowerCase()
  );

  if (currentIndex === -1) {
    return null;
  }

  const prevAlgo = currentIndex > 0 ? ALGORITHMS_REGISTRY[currentIndex - 1] : null;
  const nextAlgo = currentIndex < ALGORITHMS_REGISTRY.length - 1 ? ALGORITHMS_REGISTRY[currentIndex + 1] : null;
  const currentAlgo = ALGORITHMS_REGISTRY[currentIndex];

  return (
    <>
    {/* The algorithm pages' one ad: below the result and steps, above the next/previous links (plan 6.2) */}
    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ALGORITHM} className="w-full md:w-[80%] mx-auto mt-12" />
    <div className="w-full md:w-[80%] mx-auto mt-12 mb-6 pt-6 border-t border-gray-200 dark:border-neutral-700">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm">
        
        {/* Previous Button */}
        {prevAlgo ? (
          <Link
            href={prevAlgo.path}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 bg-gray-50 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-neutral-800/80 transition-all text-left w-full sm:w-auto"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-neutral-700 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider block">Previous</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {prevAlgo.title}
              </span>
            </div>
          </Link>
        ) : (
          <div className="w-full sm:w-auto invisible sm:visible"></div>
        )}

        {/* Counter / Tracker */}
        <div className="text-center px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400">
          <span>{currentAlgo.unit}</span>
          <span className="mx-2">•</span>
          <span>{currentIndex + 1} of {ALGORITHMS_REGISTRY.length}</span>
        </div>

        {/* Next Button */}
        {nextAlgo ? (
          <Link
            href={nextAlgo.path}
            className="group flex items-center justify-end gap-3 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 bg-gray-50 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-neutral-800/80 transition-all text-right w-full sm:w-auto"
          >
            <div>
              <span className="text-xs uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider block">Next</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {nextAlgo.title}
              </span>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-neutral-700 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ) : (
          <div className="w-full sm:w-auto invisible sm:visible"></div>
        )}

      </div>
    </div>
    </>
  );
}
