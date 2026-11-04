'use client';
// Matrix input and display for the Unit 8 pages (determinant, inverse, rank, matrix calculator).
// The input grid copies the look of components/MatrixInputGrid.js (used by Unit 4) but allows
// rectangular matrices, sizes 1–6, fractions like 1/3, and pasting a whole matrix as text.
import React, { useEffect, useState } from 'react';
import { BlockMath } from 'react-katex';
import { texNumber, matrixTex } from '@/app/utils/numeric/latex';
import { parseMatrixText } from '@/app/utils/numeric/matrix';

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

/** A rows×cols matrix of strings, keeping the old entries where they fit. */
export function resize(value, r, c, fill = (i, j) => (i === j ? '1' : '0')) {
  return Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => value[i]?.[j] ?? fill(i, j)));
}

const selectClass = 'px-3 py-2 min-h-[44px] bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none';
const smallButton = 'px-4 py-2 min-h-[44px] bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border-2 border-black/40 dark:border-neutral-600 rounded-xl text-xs font-mono font-bold uppercase transition-all text-black dark:text-white';
const cellClass = 'w-full min-w-0 text-center font-mono font-bold rounded-xl border-2 focus:outline-none focus:ring-2 transition-all bg-neutral-50 dark:bg-neutral-800 border-black/60 dark:border-neutral-600 text-black dark:text-white focus:ring-black dark:focus:ring-white';

/**
 * value: string[][]   onChange(next: string[][])
 * square: one size picker instead of rows and columns.
 */
export function MatrixInput({ label = 'A', value, onChange, square = false, min = 1, max = 6 }) {
  const phone = usePhone();
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteError, setPasteError] = useState('');
  const r = value.length;
  const c = value[0]?.length || 0;
  const sizes = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const setCell = (i, j, v) => onChange(value.map((row, a) => (a === i ? row.map((x, b) => (b === j ? v : x)) : row)));
  const random = () => onChange(value.map((row) => row.map(() => String(Math.floor(Math.random() * 19) - 9))));
  const clear = () => onChange(value.map((row) => row.map(() => '')));
  const usePaste = () => {
    try {
      const m = parseMatrixText(pasteText, max);
      if (square && m.length !== m[0].length) throw new Error(`This needs a square matrix; that one is ${m.length}×${m[0].length}.`);
      onChange(m);
      setPasteError('');
      setPasteOpen(false);
    } catch (e) {
      setPasteError(e.message);
    }
  };

  const controls = (
    <div className="flex items-center gap-3 flex-wrap">
      {square ? (
        <label className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase text-black dark:text-white">Size of {label}:</span>
          <select value={r} onChange={(e) => onChange(resize(value, +e.target.value, +e.target.value))} className={selectClass}>
            {sizes.map((s) => <option key={s} value={s}>{s}×{s}</option>)}
          </select>
        </label>
      ) : (
        <>
          <label className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-black dark:text-white">Rows:</span>
            <select value={r} onChange={(e) => onChange(resize(value, +e.target.value, c))} className={selectClass}>
              {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-black dark:text-white">Columns:</span>
            <select value={c} onChange={(e) => onChange(resize(value, r, +e.target.value))} className={selectClass}>
              {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </>
      )}
      <button type="button" onClick={random} className={smallButton}>🎲 Random</button>
      <button type="button" onClick={clear} className={smallButton}>Clear</button>
      <button type="button" onClick={() => { setPasteOpen((o) => !o); setPasteError(''); }} aria-expanded={pasteOpen} className={smallButton}>
        Paste
      </button>
    </div>
  );

  const paste = pasteOpen && (
    <div className="space-y-2 p-3 border-2 border-dashed border-black/40 dark:border-neutral-600 rounded-xl">
      <label className="block space-y-1">
        <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">One row per line, numbers separated by spaces or commas</span>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder={'2 -3 1\n2 0 -1\n1 4 5'}
          className="w-full p-3 font-mono text-base bg-neutral-50 dark:bg-neutral-800 border-2 border-black/60 dark:border-neutral-600 rounded-xl text-black dark:text-white"
        />
      </label>
      {pasteError && <p role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">{pasteError}</p>}
      <button type="button" onClick={usePaste} className={smallButton}>Use these numbers</button>
    </div>
  );

  const cellLabel = (i, j) => `${label}${SUB[i + 1] || i + 1}${SUB[j + 1] || j + 1}`;
  const input = (i, j, extra) => (
    <input
      type="text"
      autoComplete="off"
      spellCheck={false}
      value={value[i][j]}
      aria-label={`Matrix ${label}, row ${i + 1}, column ${j + 1}`}
      onChange={(e) => setCell(i, j, e.target.value)}
      className={`${cellClass} ${extra}`}
    />
  );

  // Phones: one card per row, two labelled boxes per line, so long numbers are never cut off
  if (phone) {
    return (
      <div className="space-y-4">
        {controls}
        {paste}
        <div className="space-y-2">
          {value.map((row, i) => (
            <fieldset key={i} className="border-2 border-black/25 dark:border-neutral-700 rounded-xl px-2 pb-2 pt-1">
              <legend className="px-1 text-[11px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Row {i + 1}</legend>
              <div className="grid grid-cols-2 gap-1.5">
                {row.map((_, j) => (
                  <label key={j} className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">{cellLabel(i, j)}</span>
                    {input(i, j, 'h-11 px-1 text-base')}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {controls}
      {paste}
      <div className="overflow-x-auto">
        <div className="inline-flex items-center gap-1">
          <span className="font-mono font-black text-lg pr-2 text-black dark:text-white">{label} =</span>
          <div className="w-3 border-l-2 border-t-2 border-b-2 border-black dark:border-white" style={{ height: `${r * 52}px` }} />
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${c}, 6rem)` }}>
            {value.map((row, i) => row.map((_, j) => <div key={`${i}-${j}`}>{input(i, j, 'h-12 px-1 text-sm')}</div>))}
          </div>
          <div className="w-3 border-r-2 border-t-2 border-b-2 border-black dark:border-white" style={{ height: `${r * 52}px` }} />
        </div>
      </div>
    </div>
  );
}

// texNumber and matrixTex live in utils/numeric/latex.js (engines use them too); re-exported here for pages
export { texNumber, matrixTex };

/** A matrix shown the textbook way, with an optional "A =" in front. */
export function MatrixView({ matrix, prefix = '', ...opts }) {
  return (
    <div className="overflow-x-auto text-center text-black dark:text-white">
      <BlockMath math={`${prefix}${matrixTex(matrix, opts)}`} />
    </div>
  );
}

/** Every row operation with the matrix after it. ops: [{ text, matrix }] from utils/numeric/matrix.js. */
export function RowOps({ ops, divider = null, fractions = true }) {
  if (!ops?.length) return null;
  return (
    <ol className="space-y-3">
      {ops.map((op, i) => (
        <li key={i} className="border border-black/20 dark:border-neutral-700 rounded-xl overflow-hidden">
          <div className="bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-xs font-mono font-bold text-black dark:text-white border-b border-black/20 dark:border-neutral-700">
            Step {i + 1}: {op.text}
          </div>
          {op.matrix && <div className="p-2"><MatrixView matrix={op.matrix} divider={divider} fractions={fractions} /></div>}
        </li>
      ))}
    </ol>
  );
}
