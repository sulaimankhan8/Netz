'use client';
// The live heights and distances calculator. The maths is in src/app/utils/engines/heights-distances.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/heights-distances';

const TYPES = [
  { value: 'height', label: 'Find the height' }, { value: 'distance', label: 'Find the distance' }, { value: 'angle', label: 'Find the angle' },
  { value: 'two-points', label: 'Two observation points' }, { value: 'depression', label: 'Two angles of depression' },
];
const EXAMPLES = [
  { label: 'tower: 30 m away, 60°', input: { type: 'height', d: '30', theta: '60', eye: '' } },
  { label: 'walk 20 m: 30° → 60°', input: { type: 'two-points', d: '20', alpha: '60', beta: '30', side: 'same' } },
  { label: 'lighthouse 75 m: two ships', input: { type: 'depression', h: '75', alpha: '60', beta: '30' } },
  { label: 'kite string angle', input: { type: 'angle', h: '30', d: '17.32' } },
];

/** A simple diagram: ground, tower, observer(s) and the angle(s). Not to scale for extreme angles. */
function Diagram({ d }) {
  const W = 340, H = 200, g = 170;
  const towerX = 270;
  const towerH = 140; // fixed size: the diagram shows the set-up, not the scale
  const top = g - towerH;
  const obs = [];
  if (d.kind === 'single') obs.push({ x: 60, label: `${Number(d.angle.toFixed(2))}°` });
  if (d.kind === 'two-same') { obs.push({ x: 40, label: `${d.beta}°` }, { x: 150, label: `${d.alpha}°` }); }
  if (d.kind === 'two-opposite') { obs.push({ x: 60, label: `${d.alpha}°` }); }
  const depression = d.kind === 'depression';
  const objs = depression ? [{ x: 50, label: `${d.beta}°` }, { x: 160, label: `${d.alpha}°` }] : [];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Diagram of the problem" className="w-full max-w-[360px] h-auto text-black dark:text-white rounded-xl border-2 border-black/20 dark:border-neutral-700 bg-white dark:bg-neutral-900">
      <line x1="10" y1={g} x2={W - 10} y2={g} stroke="currentColor" strokeWidth="2" />
      <rect x={towerX - 6} y={top} width="12" height={towerH} fill="#3B6FC2" className="dark:fill-[#4F80D4]" />
      <text x={towerX + 14} y={(top + g) / 2} fontSize="12" fill="currentColor" fontFamily="ui-monospace, monospace">h</text>
      {d.kind === 'two-opposite' && (
        <g>
          <line x1={towerX} y1={top} x2={W - 15} y2={g} stroke="#D9692A" strokeWidth="2" strokeDasharray="5 4" />
          <circle cx={W - 15} cy={g} r="4" fill="#D9692A" />
          <text x={W - 60} y={g - 8} fontSize="11" fill="currentColor" fontFamily="ui-monospace, monospace">{d.beta}°</text>
        </g>
      )}
      {obs.map((o, i) => (
        <g key={i}>
          <line x1={o.x} y1={g} x2={towerX} y2={top} stroke="#D9692A" strokeWidth="2" strokeDasharray="5 4" />
          <circle cx={o.x} cy={g} r="4" fill="#D9692A" />
          <text x={o.x + 22} y={g - 8} fontSize="11" fill="currentColor" fontFamily="ui-monospace, monospace">{o.label}</text>
        </g>
      ))}
      {depression && (
        <g>
          <line x1={towerX} y1={top} x2={20} y2={top} stroke="currentColor" strokeOpacity="0.5" strokeDasharray="3 3" />
          {objs.map((o, i) => (
            <g key={i}>
              <line x1={towerX} y1={top} x2={o.x} y2={g} stroke="#D9692A" strokeWidth="2" strokeDasharray="5 4" />
              <circle cx={o.x} cy={g} r="4" fill="#D9692A" />
              <text x={towerX - 70 - i * 30} y={top + 14 + i * 12} fontSize="11" fill="currentColor" fontFamily="ui-monospace, monospace">{o.label}</text>
            </g>
          ))}
        </g>
      )}
      <text x="12" y="16" fontSize="10" fill="currentColor" opacity="0.6" fontFamily="ui-monospace, monospace">not to scale</text>
    </svg>
  );
}

export default function HeightsCalculator() {
  return (
    <SymbolicCalculator
      id="heights-distances" unit={9} title="Heights & Distances Engine" button="Solve"
      start={{ type: 'height', d: '30', h: '', theta: '60', alpha: '', beta: '', eye: '', side: 'same', unit: 'm' }}
      fields={[
        { key: 'type', label: 'Problem', kind: 'choice', options: TYPES },
        { key: 'd', label: 'Distance (on the ground)', show: (v) => ['height', 'angle'].includes(v.type) },
        { key: 'd', label: 'Distance between the two points', show: (v) => v.type === 'two-points' },
        { key: 'h', label: 'Height', show: (v) => ['distance', 'angle', 'depression'].includes(v.type) },
        { key: 'theta', label: 'Angle (degrees)', show: (v) => ['height', 'distance'].includes(v.type) },
        { key: 'alpha', label: 'Bigger angle α (nearer)', show: (v) => ['two-points', 'depression'].includes(v.type) },
        { key: 'beta', label: 'Smaller angle β (farther)', show: (v) => ['two-points', 'depression'].includes(v.type) },
        { key: 'side', label: 'Points', kind: 'select', options: [{ value: 'same', label: 'Same side of the tower' }, { value: 'opposite', label: 'Opposite sides' }], show: (v) => v.type === 'two-points' },
        { key: 'eye', label: "Observer's height (optional)", show: (v) => v.type === 'height' },
        { key: 'unit', label: 'Unit', placeholder: 'm' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="With 30°, 45°, 60° (and 15°, 75°) the answers come out exactly, like 10√3 m."
      resultLabel={(a) => a.result.label}
      renderResult={(a) => (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
          <div className="space-y-2 min-w-0">
            <div className="overflow-x-auto text-lg"><BlockMath math={a.valueTex} /></div>
          </div>
          <div className="flex justify-center"><Diagram d={a.diagram} /></div>
        </div>
      )}
    />
  );
}
