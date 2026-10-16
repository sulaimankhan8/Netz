'use client';

import React, { useState, useRef, useEffect } from 'react';
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

const ACTIONS = [
  { key: 'PLOT_GRAPH', label: 'Plot Graph', Icon: FiBarChart2, colour: 'text-blue-500', hover: 'hover:bg-blue-500/10 hover:text-blue-500' },
  { key: 'DIFFERENTIATE', label: 'Differentiate (d/dx)', Icon: FiTrendingUp, colour: 'text-purple-500', hover: 'hover:bg-purple-500/10 hover:text-purple-500' },
  { key: 'INTEGRATE', label: 'Integrate (∫)', Icon: FiZap, colour: 'text-emerald-500', hover: 'hover:bg-emerald-500/10 hover:text-emerald-500' },
  { key: 'FIND_ROOTS', label: 'Find Roots / Solve', Icon: FiCheckCircle, colour: 'text-amber-500', hover: 'hover:bg-amber-500/10 hover:text-amber-500' },
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
        title="Contextual CAS & AI Transforms"
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>AI</span>
      </button>

      {/* Popover Action Menu */}
      {isOpen && (
        <div
          className={`absolute top-8 right-0 z-50 ${showExamples ? 'w-[300px]' : 'min-w-[190px]'} max-w-[calc(100vw-24px)] max-h-[70vh] overflow-y-auto overscroll-contain p-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150`}
          data-cas-menu
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
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
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 ${hover} rounded-lg transition-colors cursor-pointer`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${colour}`} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Examples to try: each fills the equation and runs its action */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-1">
                <button
                  type="button"
                  onClick={() => setShowExamples(!showExamples)}
                  aria-expanded={showExamples}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
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
                          <div className={`flex items-center gap-1.5 px-1.5 py-1 text-[11px] font-semibold ${action ? action.colour : ''}`}>
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
                                className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left text-zinc-900 dark:text-zinc-100"
                              >
                                <span className="min-w-0 overflow-x-auto"><KatexView latex={item.latex} /></span>
                                <span className="shrink-0 text-[10px] text-zinc-500 dark:text-zinc-400">{item.name}</span>
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
