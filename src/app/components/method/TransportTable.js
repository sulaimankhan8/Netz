'use client';
// A transportation tableau: each cell shows its cost (small, top right) and its allocation (bold), with the supply
// column and demand row; after MODI, the u and v numbers on the margins and dᵢⱼ in the empty cells.
import React from 'react';

export default function TransportTable({ table, caption }) {
  if (!table) return null;
  const { rowNames, colNames, costs, alloc, supply, demand, u, v, d } = table;
  const cell = 'border border-black/30 dark:border-neutral-600 p-1.5 align-top min-w-[3.25rem]';
  return (
    <div className="space-y-1">
      {caption && <p className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">{caption}</p>}
      <div className="overflow-x-auto">
        <table className="border-collapse font-mono text-sm">
          <thead>
            <tr>
              <th className="p-1.5" />
              {colNames.map((c) => <th key={c} className="p-1.5 text-xs font-bold">{c}</th>)}
              <th className="p-1.5 text-xs font-bold">Supply</th>
              {u && <th className="p-1.5 text-xs font-bold">u</th>}
            </tr>
          </thead>
          <tbody>
            {costs.map((row, i) => (
              <tr key={rowNames[i]}>
                <th className="p-1.5 text-xs font-bold text-left">{rowNames[i]}</th>
                {row.map((c, j) => {
                  const a = alloc[i][j];
                  const basic = a !== null && a !== undefined;
                  return (
                    <td key={j} className={`${cell} ${basic ? 'bg-[#FFE600]/25 dark:bg-amber-950/40' : ''}`}>
                      <div className="text-[10px] text-right text-neutral-500">{c}</div>
                      <div className="text-center font-bold">{basic ? (a === 0 ? 'ε' : a) : d && d[i][j] !== null ? <span className={`font-normal text-xs ${d[i][j] < 0 ? 'text-red-600 dark:text-red-400' : 'text-neutral-500'}`}>{d[i][j]}</span> : ''}</div>
                    </td>
                  );
                })}
                <td className={`${cell} text-center`}>{supply[i]}</td>
                {u && <td className="p-1.5 text-center text-xs">{u[i]}</td>}
              </tr>
            ))}
            <tr>
              <th className="p-1.5 text-xs font-bold text-left">Demand</th>
              {demand.map((q, j) => <td key={j} className={`${cell} text-center`}>{q}</td>)}
              <td />
            </tr>
            {v && (
              <tr>
                <th className="p-1.5 text-xs font-bold text-left">v</th>
                {v.map((q, j) => <td key={j} className="p-1.5 text-center text-xs">{q}</td>)}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
