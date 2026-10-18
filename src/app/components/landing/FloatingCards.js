'use client';

import { useState } from 'react';
import { IconDownload, IconGraph, IconSteps, IconTable } from './icons';

const BASE_Z = { graph: 2, export: 1, steps: 3, table: 2 };

/**
 * "Everything a method gives you": Graph, Export, Steps and Tables cards in a pile over the original
 * background, inspired by the old hero. The pile spreads as the section scrolls in
 * (CSS scroll-driven animation in landing.css); tapping a card's header brings it to the front.
 * Under 700 px the cards become a swipe row.
 */
export default function FloatingCards() {
  const [front, setFront] = useState('steps');
  const z = (id) => ({ '--z': front === id ? 10 : BASE_Z[id] });
  const head = (id, label, Icon) => (
    <button type="button" className="ld-fc-head" onClick={() => setFront(id)} aria-pressed={front === id}>
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="ld-stage" role="group" aria-label="What a method gives you">
      <div className="ld-fc ld-fc-graph" style={z('graph')}>
        {head('graph', 'GRAPH', IconGraph)}
        <div className="ld-fc-body">
          <span className="ld-math" style={{ fontSize: 17 }}>
            y = 2x<sup style={{ fontSize: 11 }}>2</sup> − 3x + 1
          </span>
          <svg width="100%" height="112" viewBox="0 0 240 110" role="img" aria-label="Parabola crossing the x axis at 0.5 and 1">
            <path d="M10 88.75 H232" stroke="var(--ld-line)" strokeWidth="1.5" />
            <path d="M46.7 4 V106" stroke="var(--ld-line)" strokeWidth="1.5" />
            <path d="M10 21.25 Q101.7 161.9 193.3 21.25" stroke="var(--ld-graph)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="83.3" cy="88.75" r="4.5" fill="var(--ld-surface)" stroke="var(--ld-graph)" strokeWidth="2.5" />
            <circle cx="120" cy="88.75" r="4.5" fill="var(--ld-surface)" stroke="var(--ld-graph)" strokeWidth="2.5" />
          </svg>
          <span style={{ fontSize: 13, color: 'var(--ld-text2)' }}>Roots at x = 0.5 and x = 1</span>
        </div>
      </div>

      <div className="ld-fc ld-fc-export" style={z('export')}>
        {head('export', 'EXPORT', IconDownload)}
        <div className="ld-fc-body" style={{ gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="ld-fc-chip is-on">PNG</span>
            <span className="ld-fc-chip">PDF</span>
            <span className="ld-fc-chip">Markdown</span>
          </div>
          <div className="ld-fc-file">
            <span style={{ width: 40, height: 48, borderRadius: 6, background: 'var(--ld-tray)', border: '1px solid var(--ld-line)', flexShrink: 0 }} />
            <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="ld-mono" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                gauss-seidel-steps.png
              </span>
              <span style={{ fontSize: 12, color: 'var(--ld-ok)', fontWeight: 600 }}>Saved</span>
            </span>
          </div>
        </div>
      </div>

      <div className="ld-fc ld-fc-steps" style={z('steps')}>
        {head('steps', 'STEPS', IconSteps)}
        <div className="ld-fc-body">
          <span className="ld-math" style={{ fontSize: 16 }}>
            x<sup style={{ fontSize: 10 }}>3</sup> − 4x<sup style={{ fontSize: 10 }}>2</sup> + 5x − 2 = 0
          </span>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Try x = 1: 1 − 4 + 5 − 2 = 0</li>
            <li>Divide: (x − 1)(x² − 3x + 2)</li>
            <li>Factor: (x − 1)²(x − 2)</li>
            <li style={{ fontWeight: 700, color: 'var(--ld-steps)' }}>Roots: x = 1 (twice), x = 2</li>
          </ol>
        </div>
      </div>

      <div className="ld-fc ld-fc-table" style={z('table')}>
        {head('table', 'TABLES', IconTable)}
        <div className="ld-fc-body">
          <span className="ld-math" style={{ fontSize: 16 }}>y = 3x + 2</span>
          <table className="ld-mono">
            <tbody>
              <tr style={{ color: 'var(--ld-text2)' }}>
                <th scope="row" style={{ textAlign: 'left', fontWeight: 400 }}>x</th>
                <td>0</td><td>1</td><td>2</td><td>3</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--ld-line)' }}>
                <th scope="row" style={{ textAlign: 'left', fontWeight: 400, color: 'var(--ld-text2)' }}>y</th>
                <td>2</td><td>5</td><td>8</td><td>11</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
