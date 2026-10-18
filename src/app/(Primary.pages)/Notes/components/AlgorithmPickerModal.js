'use client';

import { useState } from 'react';
import { LuLayers, LuPlus, LuSearch } from 'react-icons/lu';
import { ALGORITHMS_CATALOG } from '../utils/algorithmRegistry';
import { chipClass, FIELD, FIELD_INPUT, Modal } from './ui';

/** Add a solver: all 34 algorithms, searchable and filtered by unit. */
export default function AlgorithmPickerModal({ isOpen, onClose, onSelectAlgorithm, isPhone }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('All');

  if (!isOpen) return null;

  const units = ['All', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];
  const q = searchQuery.toLowerCase();

  const filteredAlgorithms = ALGORITHMS_CATALOG.filter((alg) => {
    const matchesSearch = alg.name.toLowerCase().includes(q) || alg.description.toLowerCase().includes(q) || alg.unit.toLowerCase().includes(q);
    const matchesUnit = selectedUnit === 'All' ? true : alg.unit.toLowerCase().includes(selectedUnit.toLowerCase());
    return matchesSearch && matchesUnit;
  });

  return (
    <Modal title="Add a solver" onClose={onClose} isPhone={isPhone} width="max-w-[720px]">
      <div className={`sticky top-0 z-10 bg-nt-surface flex flex-col gap-3 border-b border-nt-line ${isPhone ? 'px-5 pt-3 pb-3' : 'px-6 pt-3 pb-3.5'}`}>
        <label className={`${FIELD} !h-11`}>
          <LuSearch className="w-[18px] h-[18px] text-nt-text2 shrink-0" aria-hidden="true" />
          <input
            type="text"
            aria-label="Search algorithms"
            placeholder="Search: bisection, Euler, z-test, RK4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={FIELD_INPUT}
          />
        </label>
        <div className="flex gap-1.5 overflow-x-auto nt-noscroll" role="group" aria-label="Unit">
          {units.map((unit) => {
            const count = unit === 'All' ? ALGORITHMS_CATALOG.length : ALGORITHMS_CATALOG.filter((a) => a.unit.toLowerCase().includes(unit.toLowerCase())).length;
            const on = selectedUnit === unit;
            return (
              <button key={unit} type="button" aria-pressed={on} onClick={() => setSelectedUnit(unit)} className={chipClass(on)}>
                {unit}
                <span className="opacity-70 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 ${isPhone ? 'px-5 pt-3 pb-8' : 'px-6 pt-4 pb-6'}`}>
        {filteredAlgorithms.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-nt-text2">
            <LuLayers className="w-8 h-8 mx-auto mb-2" aria-hidden="true" />
            <p className="m-0">No algorithm matches your search.</p>
          </div>
        ) : (
          filteredAlgorithms.map((alg) => (
            <button
              key={alg.id}
              type="button"
              onClick={() => {
                onSelectAlgorithm(alg);
                onClose();
              }}
              className="group text-left flex flex-col gap-1.5 p-3.5 rounded-2xl border border-nt-line bg-nt-surface hover:border-nt-accent hover:bg-nt-accent-tint focus-visible:outline-none focus-visible:border-nt-accent focus-visible:bg-nt-accent-tint transition-colors"
            >
              <span className="flex items-start justify-between gap-2 w-full">
                <span className="text-[15px] leading-[21px] font-semibold text-nt-ink group-hover:text-nt-accent-on-tint group-focus-visible:text-nt-accent-on-tint">{alg.name}</span>
                <span className="shrink-0 text-xs text-nt-text2 group-hover:hidden group-focus-visible:hidden">{alg.unit.split(':')[0]}</span>
                <span className="shrink-0 hidden group-hover:inline-flex group-focus-visible:inline-flex items-center gap-1 text-xs font-semibold text-nt-accent-on-tint">
                  <LuPlus className="w-3.5 h-3.5" aria-hidden="true" />
                  Add
                </span>
              </span>
              <span className="text-[13px] leading-[19px] text-nt-text2 line-clamp-2">{alg.description}</span>
            </button>
          ))
        )}
      </div>
    </Modal>
  );
}
