'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Sparkles } from 'lucide-react';
import {
  FiBarChart2,
  FiTrendingUp,
  FiZap,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import { CAS_EXAMPLES } from '../utils/equations/casExamples';
import KatexView from './equation/KatexView';

// Room kept clear for the top bar and the dock when the menu is fitted to the screen (px)
const TOP_CLEAR = 72;
const BOTTOM_CLEAR = 96;

const ACTIONS = [
  { key: 'PLOT_GRAPH', label: 'Plot Graph', Icon: FiBarChart2, colour: 'text-pg-text2', hover: 'hover:bg-pg-tray hover:text-pg-ink' },
  { key: 'DIFFERENTIATE', label: 'Differentiate (d/dx)', Icon: FiTrendingUp, colour: 'text-pg-text2', hover: 'hover:bg-pg-tray hover:text-pg-ink' },
  { key: 'INTEGRATE', label: 'Integrate (∫)', Icon: FiZap, colour: 'text-pg-text2', hover: 'hover:bg-pg-tray hover:text-pg-ink' },
  { key: 'FIND_ROOTS', label: 'Find Roots / Solve', Icon: FiCheckCircle, colour: 'text-pg-text2', hover: 'hover:bg-pg-tray hover:text-pg-ink' },
];

/**
 * The AI button of an equation block: the CAS actions (Plot Graph, Differentiate, Integrate,
 * Find Roots) on the block's equation, and examples to try them with. An example is put in the
 * equation and its action runs at once: onSelectAction(block, action, exampleLatex).
 */
export default function AIActionButton({ block, onSelectAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const popoverRef = useRef(null);
  const menuRef = useRef(null);
  // Where the menu opens and how tall it may be, so all of it stays on screen: below the button
  // when there is room, otherwise above it, scrolling inside when it is longer than that
  const [fit, setFit] = useState({ above: false, maxHeight: null });

  useLayoutEffect(() => {
    if (!isOpen || !popoverRef.current || !menuRef.current) return;
    const button = popoverRef.current.getBoundingClientRect();
    const menu = menuRef.current;
    // The block may be zoomed (a CSS scale): heights set in CSS are multiplied by it
    const scale = menu.offsetWidth ? menu.getBoundingClientRect().width / menu.offsetWidth : 1;
    const below = window.innerHeight - BOTTOM_CLEAR - button.bottom - 8;
    const above = button.top - TOP_CLEAR - 8;
    const openAbove = below < 320 && above > below;
    const room = Math.max(160, openAbove ? above : below);
    setFit({ above: openAbove, maxHeight: Math.floor(room / (scale || 1)) });
  }, [isOpen, showExamples]);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
      return () => window.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleAction = (actionKey, exampleLatex) => {
    setIsOpen(false);
    onSelectAction(block, actionKey, exampleLatex);
  };

  const { type } = block;

  return (
    <div ref={popoverRef} className="relative inline-block">
      {/* Sparkles AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Maths actions: solve, differentiate, integrate, plot"
        aria-label="Maths actions"
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-pg-accent-tint text-pg-accent-on-tint hover:brightness-95 shadow-xs transition-all active:scale-95 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>AI</span>
      </button>

      {/* Popover Action Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          style={fit.maxHeight ? { maxHeight: fit.maxHeight } : undefined}
          className={`absolute ${fit.above ? 'bottom-8' : 'top-8'} right-0 z-50 ${showExamples ? 'w-[300px]' : 'min-w-[190px]'} max-w-[calc(100vw-24px)] max-h-[70vh] overflow-y-auto overscroll-contain p-1.5 rounded-xl bg-pg-surface backdrop-blur-xl border border-pg-line shadow-2xl animate-in fade-in zoom-in-95 duration-150`}
          data-cas-menu
        >
          <div className="px-2.5 py-1.5 text-pg-cap font-bold uppercase tracking-wider text-pg-text2 border-b border-pg-line">
            CAS Actions
          </div>

          {/* Equation Block Actions */}
          {type === 'equation' && (
            <>
              <div className="py-1 space-y-0.5">
                {ACTIONS.map(({ key, label, Icon, colour, hover }) => (
                  <button
                    key={key}
                    onClick={() => handleAction(key)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-pg-ink ${hover} rounded-lg transition-colors cursor-pointer`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${colour}`} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Examples to try: each fills the equation and runs its action */}
              <div className="border-t border-pg-line pt-1">
                <button
                  type="button"
                  onClick={() => setShowExamples(!showExamples)}
                  aria-expanded={showExamples}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-pg-cap font-bold uppercase tracking-wider text-pg-text2 hover:text-pg-ink rounded-lg"
                  data-cas-examples-toggle
                >
                  <span>Try an example</span>
                  {showExamples ? <FiChevronDown className="w-3.5 h-3.5" /> : <FiChevronRight className="w-3.5 h-3.5" />}
                </button>
                {showExamples && (
                  <div className="flex flex-col gap-2 px-1 pb-1" data-cas-examples>
                    {CAS_EXAMPLES.map((group) => {
                      const action = ACTIONS.find((a) => a.key === group.action);
                      const Icon = action ? action.Icon : FiZap;
                      return (
                        <section key={group.action}>
                          <div className={`flex items-center gap-1.5 px-1.5 py-1 text-pg-cap font-semibold ${action ? action.colour : ''}`}>
                            <Icon className="w-3 h-3" />
                            {group.label}
                          </div>
                          <div className="flex flex-col gap-1">
                            {group.items.map((item) => (
                              <button
                                key={item.latex}
                                type="button"
                                onClick={() => handleAction(group.action, item.latex)}
                                title={`${group.label}: ${item.name}`}
                                data-cas-example={item.latex}
                                className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border border-pg-line hover:border-pg-text2/40 hover:bg-pg-tray text-left text-pg-ink"
                              >
                                <span className="min-w-0 overflow-x-auto"><KatexView latex={item.latex} /></span>
                                <span className="shrink-0 text-pg-cap text-pg-text2">{item.name}</span>
                              </button>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
