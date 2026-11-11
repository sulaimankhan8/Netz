'use client';
// A Karnaugh map: rows and columns in Gray-code order, 1s, 0s and don't-cares (X), and the chosen groups
// outlined in colour (a group that wraps round an edge is drawn as its separate pieces).
import React from 'react';
import { InlineMath } from 'react-katex';

const COLORS = ['#3B6FC2', '#D9692A', '#2E9E6B', '#B0418F', '#8A6D1F', '#4B8FA8', '#C2413B', '#6B4FC2'];

export default function KMap({ map, groups = [] }) {
  if (!map) return null;
  const { rowVars, colVars, rowLabels, colLabels, grid } = map;
  const groupsOf = (i) => groups.map((g, k) => (g.cells.includes(i) ? k : -1)).filter((k) => k >= 0);
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="border-collapse font-mono text-sm">
          <thead>
            <tr>
              <th className="p-1.5 text-xs text-neutral-600 dark:text-neutral-400">{rowVars}\{colVars}</th>
              {colLabels.map((c) => <th key={c} className="p-1.5 text-xs font-bold">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={rowLabels[r]}>
                <th className="p-1.5 text-xs font-bold">{rowLabels[r]}</th>
                {row.map((cell) => {
                  const gs = groupsOf(cell.i);
                  const shadow = gs.map((k, n) => `inset 0 0 0 ${2 + 3 * n}px ${COLORS[k % COLORS.length]}`).join(', ');
                  return (
                    <td key={cell.i} className={`w-12 h-12 sm:w-14 sm:h-14 text-center border border-black/30 dark:border-neutral-600 ${cell.v === '1' ? 'font-bold text-black dark:text-white' : 'text-neutral-500'}`} style={shadow ? { boxShadow: shadow } : undefined}>
                      <div className="leading-tight">{cell.v}</div>
                      <div className="text-[10px] text-neutral-500">{cell.i}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {groups.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {groups.map((g, k) => (
            <li key={g.term + k} className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: COLORS[k % COLORS.length] }} />
              <InlineMath math={g.term} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
