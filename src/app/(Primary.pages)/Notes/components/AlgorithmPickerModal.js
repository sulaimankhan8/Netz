'use client';

import { useState } from 'react';
import { ALGORITHMS_CATALOG } from '../utils/algorithmRegistry';
import { FaSearch, FaTimes, FaCalculator, FaLayerGroup } from 'react-icons/fa';

export default function AlgorithmPickerModal({ isOpen, onClose, onSelectAlgorithm }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('All');

  if (!isOpen) return null;

  const units = ['All', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];

  const filteredAlgorithms = ALGORITHMS_CATALOG.filter((alg) => {
    const matchesSearch =
      alg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alg.unit.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUnit =
      selectedUnit === 'All' ? true : alg.unit.toLowerCase().includes(selectedUnit.toLowerCase());

    return matchesSearch && matchesUnit;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-neutral-900 dark:text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-slate-800 bg-neutral-50/80 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center space-x-2.5 text-indigo-600 dark:text-indigo-400">
            <FaCalculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Select Interactive Algorithm Widget</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Unit Filters */}
        <div className="p-4 border-b border-neutral-200 dark:border-slate-800/80 bg-neutral-50/50 dark:bg-slate-950/50 space-y-3 shrink-0">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-3 text-neutral-400 dark:text-slate-500 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search algorithm (e.g. bisection, newton forward, euler, z-test, rk4)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs scrollbar-none">
            {units.map((unit) => (
              <button
                key={unit}
                onClick={() => setSelectedUnit(unit)}
                className={`px-3 py-1 rounded-xl shrink-0 font-medium transition-all ${
                  selectedUnit === unit
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {unit === 'All' ? 'All Algorithms' : unit}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm List Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredAlgorithms.length === 0 ? (
            <div className="col-span-full py-12 text-center text-neutral-400 dark:text-slate-500 text-xs">
              <FaLayerGroup className="w-8 h-8 mx-auto mb-2 text-neutral-400 dark:text-slate-600" />
              <p>No algorithms found matching your search.</p>
            </div>
          ) : (
            filteredAlgorithms.map((alg) => (
              <div
                key={alg.id}
                onClick={() => {
                  onSelectAlgorithm(alg);
                  onClose();
                }}
                className="group p-4 rounded-xl bg-neutral-50 dark:bg-slate-950/60 border border-neutral-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:bg-neutral-100/80 dark:hover:bg-slate-850 cursor-pointer transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                      {alg.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-indigo-300 font-mono shrink-0 ml-2">
                      {alg.unit.split(':')[0]}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {alg.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-200/80 dark:border-slate-800/40 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                  <span>Embed Solver</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
