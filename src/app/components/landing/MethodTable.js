'use client';

import { useState } from 'react';

/*
 * "Every step, shown": three root-finding methods on f(x) = x³ − 2x − 5 (root ≈ 2.0945515).
 * The rows are worked out by hand, rounded to 6 and 4 decimals.
 */
const METHODS = [
  {
    id: 'nr',
    name: 'Newton–Raphson',
    start: 'x₀ = 2',
    rows: [['0', '2.000000', '−1.0000'], ['1', '2.100000', '0.0610'], ['2', '2.094568', '0.0002'], ['3', '2.094551', '0.0000']],
    result: 'Root ≈ 2.094551 after 3 steps',
  },
  {
    id: 'sec',
    name: 'Secant',
    start: 'x₀ = 2, x₁ = 3',
    rows: [['2', '2.058824', '−0.3908'], ['3', '2.081264', '−0.1472'], ['4', '2.094824', '0.0030'], ['5', '2.094550', '0.0000']],
    result: 'Root ≈ 2.094550 after 4 steps',
  },
  {
    id: 'bis',
    name: 'Bisection',
    start: 'a = 2, b = 3',
    rows: [['1', '2.500000', '5.6250'], ['2', '2.250000', '1.8906'], ['3', '2.125000', '0.3457'], ['4', '2.062500', '−0.3513'], ['5', '2.093750', '−0.0089']],
    result: 'Root between 2.09375 and 2.125 after 5 steps',
  },
];

export function MethodChips({ active, onPick }) {
  return (
    <div className="ld-chips" role="group" aria-label="Method">
      {METHODS.map((method) => (
        <button
          key={method.id}
          type="button"
          className="ld-chip"
          aria-pressed={active === method.id}
          onClick={() => onPick(method.id)}
        >
          {method.name}
        </button>
      ))}
    </div>
  );
}

export default function MethodTable({ children }) {
  const [active, setActive] = useState('nr');
  const method = METHODS.find((m) => m.id === active);

  return (
    <section id="methods" className="ld-section ld-methods">
      <div className="ld-methods-text" data-reveal="">
        {children}
        <MethodChips active={active} onPick={setActive} />
        <div className="ld-units ld-on-bg">
          <span>Unit 1 · Roots (5)</span>
          <span>Unit 2 · Interpolation (6)</span>
          <span>Unit 3 · Calculus (7)</span>
          <span>Unit 4 · Matrices and ODEs (9)</span>
          <span>Unit 5 · Fitting and tests (7)</span>
        </div>
      </div>

      <div className="ld-table-card" aria-live="polite">
        <div className="ld-table-head">
          <span>{method.name}</span>
          <span className="ld-mono" style={{ fontSize: 13, fontWeight: 400, color: 'var(--ld-text2)' }}>{method.start}</span>
        </div>
        <div className="ld-table-scroll">
          <table className="ld-table ld-mono">
            <thead>
              <tr>
                <th scope="col">n</th>
                <th scope="col">xₙ</th>
                <th scope="col">f(xₙ)</th>
              </tr>
            </thead>
            <tbody key={method.id}>
              {method.rows.map(([n, x, f]) => (
                <tr key={n}>
                  <td>{n}</td>
                  <td>{x}</td>
                  <td>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ld-result">{method.result}</div>
      </div>
    </section>
  );
}
