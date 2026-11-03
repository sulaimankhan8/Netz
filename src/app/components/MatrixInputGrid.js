'use client';

import React, { useEffect, useState } from 'react';

const SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

/** True below 640px (Tailwind's sm). False until mounted, so the server HTML is the laptop grid. */
function usePhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return phone;
}

// Shared Matrix Input Grid used by all Unit 4 matrix algorithm pages
export default function MatrixInputGrid({ n, setN, matrix, setMatrix, augmented = true }) {
  const phone = usePhone();

  const handleSizeChange = (newN) => {
    const clamp = Math.min(6, Math.max(2, parseInt(newN) || 2));
    // Rebuild matrix, keeping old values where possible
    const cols = augmented ? clamp + 1 : clamp;
    const newMatrix = Array.from({ length: clamp }, (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        if (matrix[r] && matrix[r][c] !== undefined) return matrix[r][c];
        // Default: identity on diagonal for coefficient portion
        if (!augmented) return r === c ? '1' : '0';
        if (c < clamp) return r === c ? '1' : '0';
        return '1'; // augmented column defaults
      })
    );
    setN(clamp);
    setMatrix(newMatrix);
  };

  const handleCellChange = (r, c, val) => {
    setMatrix((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = val;
      return next;
    });
  };

  const fillRandom = () => {
    const cols = augmented ? n + 1 : n;
    const newMatrix = Array.from({ length: n }, (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        if (c < n) {
          // Diagonally dominant: diagonal ≥ sum of off-diagonals
          if (c === r) return String(n * 2 + Math.floor(Math.random() * 4));
          return String(Math.floor(Math.random() * 4) - 1);
        }
        return String(Math.floor(Math.random() * 10) + 1);
      })
    );
    setMatrix(newMatrix);
  };

  const sizeControls = (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <label className="text-xs font-mono font-bold uppercase text-black dark:text-white">Matrix Size:</label>
        <select
          value={n}
          onChange={(e) => handleSizeChange(e.target.value)}
          className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none"
        >
          {[2, 3, 4, 5, 6].map((sz) => (
            <option key={sz} value={sz}>{sz}×{sz}</option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={fillRandom}
        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border-2 border-black/40 dark:border-neutral-600 rounded-xl text-xs font-mono font-bold uppercase transition-all"
      >
        🎲 Random Example
      </button>
    </div>
  );

  const hint = augmented ? (
    <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
      💡 Yellow {phone ? 'boxes' : 'column'} = constants vector <strong>b</strong>. Coefficient matrix <strong>A</strong> is {phone ? 'in the x boxes' : 'on the left'}. Full system: <strong>Ax = b</strong>.
    </p>
  ) : null;

  const cols = augmented ? n + 1 : n;
  const cellClass = (c) => `w-full min-w-0 text-center font-mono font-bold rounded-xl border-2 focus:outline-none focus:ring-2 transition-all ${
    augmented && c === n
      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200 focus:ring-amber-400'
      : 'bg-neutral-50 dark:bg-neutral-800 border-black/60 dark:border-neutral-600 text-black dark:text-white focus:ring-black dark:focus:ring-white'
  }`;
  const cellLabel = (r, c) => {
    if (augmented && c === n) return `= b${SUB[r + 1] || r + 1}`;
    return augmented ? `x${SUB[c + 1] || c + 1}` : `col ${c + 1}`;
  };

  // Phones: one card per equation, two labelled boxes per line (fits a value like -1234.5678 at 16px), so long numbers are never cut off
  if (phone) {
    return (
      <div className="space-y-4">
        {sizeControls}
        <div className="space-y-2">
          {matrix.map((row, r) => (
            <fieldset key={r} className="border-2 border-black/25 dark:border-neutral-700 rounded-xl px-2 pb-2 pt-1">
              <legend className="px-1 text-[11px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                {augmented ? `Equation ${r + 1}` : `Row ${r + 1}`}
              </legend>
              <div className="grid grid-cols-2 gap-1.5">
                {row.map((val, c) => (
                  <label key={`${r}-${c}`} className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">{cellLabel(r, c)}</span>
                    <input
                      type="number"
                      step="any"
                      value={val}
                      aria-label={`${augmented ? `Equation ${r + 1}` : `Row ${r + 1}`}, ${cellLabel(r, c)}`}
                      onChange={(e) => handleCellChange(r, c, e.target.value)}
                      className={`${cellClass(c)} h-11 px-1`}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        {hint}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sizeControls}

      <div className="overflow-x-auto">
        {/* Phones: the cells share the width so the b column stays on screen; bigger systems scroll */}
        <div className="flex w-full sm:inline-flex sm:w-auto items-center gap-1">
          {/* Left bracket */}
          <div className="flex flex-col items-end">
            <div className="w-3 h-full border-l-2 border-t-2 border-b-2 border-black dark:border-white" style={{ height: `${n * 52}px` }} />
          </div>

          {/* Matrix cells */}
          <div className="grid gap-1 flex-1 min-w-0 sm:flex-none" style={{ gridTemplateColumns: `repeat(${cols}, minmax(3.25rem, 1fr))` }}>
            {matrix.map((row, r) =>
              row.map((val, c) => (
                <div key={`${r}-${c}`} className="relative">
                  {augmented && c === n - 1 && (
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-black/30 dark:bg-neutral-500 translate-x-2 z-10" />
                  )}
                  <input
                    type="number"
                    step="any"
                    value={val}
                    aria-label={`Row ${r + 1}, ${cellLabel(r, c)}`}
                    onChange={(e) => handleCellChange(r, c, e.target.value)}
                    // 6rem fits a value like -1234.5678 without cutting it
                    className={`${cellClass(c)} sm:w-24 h-12 px-1 text-sm`}
                  />
                </div>
              ))
            )}
          </div>

          {/* Right bracket */}
          <div className="flex flex-col items-start">
            <div className="w-3 border-r-2 border-t-2 border-b-2 border-black dark:border-white" style={{ height: `${n * 52}px` }} />
          </div>
        </div>
      </div>

      {hint}
    </div>
  );
}
