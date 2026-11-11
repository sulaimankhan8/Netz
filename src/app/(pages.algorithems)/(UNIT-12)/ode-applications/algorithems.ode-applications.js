'use client';
// The live ODE application calculator. The maths is in src/app/utils/engines/ode-applications.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/ode-applications';

const EXAMPLES = [
  {
    label: "Cooling 100° → 60° in 20 min",
    input: {
      mode: "cooling",
      Ts: "20",
      T0: "100",
      t1: "20",
      T1: "60",
      at: "40",
      target: "30"
    }
  },
  {
    label: "Radium, half-life 1600 y",
    input: {
      mode: "growth",
      N0: "100",
      how: "half",
      half: "1600",
      at: "100",
      target: ""
    }
  },
  {
    label: "Bacteria double in 2 h",
    input: {
      mode: "growth",
      N0: "1000",
      how: "reading",
      t1: "2",
      N1: "2000",
      at: "",
      target: "8000"
    }
  },
  {
    label: "RL: L = 0.5, R = 10, E = 12",
    input: {
      mode: "rl",
      L: "0.5",
      R: "10",
      E: "12",
      i0: "0",
      at: "0.1"
    }
  },
  {
    label: "RL with E = 10 sin t",
    input: {
      mode: "rl",
      L: "1",
      R: "2",
      E: "10 sin(t)",
      i0: "0",
      at: ""
    }
  },
  {
    label: "RC charging",
    input: {
      mode: "rc",
      R: "1000",
      C: "0.001",
      E: "10",
      q0: "0",
      at: "1"
    }
  },
  {
    label: "LCR, q(0) = 1",
    input: {
      mode: "lcr",
      L: "1",
      R: "2",
      C: "0.2",
      E: "0",
      q0: "1",
      i0: "0",
      at: ""
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="ode-applications" unit={12} title="Applications Engine" button="Solve"
      start={{
  mode: "cooling",
  Ts: "20",
  T0: "100",
  t1: "20",
  T1: "60",
  at: "40",
  target: "30",
  N0: "100",
  how: "half",
  N1: "",
  half: "1600",
  L: "0.5",
  R: "10",
  C: "0.01",
  E: "12",
  q0: "0",
  i0: "0"
}}
      fields={[
        { key: 'mode', label: 'Application', kind: 'select', options: [{ value: 'cooling', label: "Newton's law of cooling" }, { value: 'growth', label: "Growth and decay" }, { value: 'rl', label: "RL circuit" }, { value: 'rc', label: "RC circuit" }, { value: 'lcr', label: "LCR circuit" }] },
        { key: 'Ts', label: 'Surroundings Tₛ', placeholder: '20', show: (v) => v.mode === 'cooling' },
        { key: 'T0', label: 'Start T₀', placeholder: '100', show: (v) => v.mode === 'cooling' },
        { key: 'N0', label: 'Start N₀', placeholder: '100', show: (v) => v.mode === 'growth' },
        { key: 'how', label: 'Rate from', kind: 'choice', options: [{ value: 'reading', label: "A reading" }, { value: 'half', label: "Half-life" }, { value: 'double', label: "Doubling time" }], show: (v) => v.mode === 'growth' },
        { key: 't1', label: 'Reading time t₁', placeholder: '20', show: (v) => v.mode === 'cooling' || (v.mode === 'growth' && v.how === 'reading') },
        { key: 'T1', label: 'Reading T₁', placeholder: '60', show: (v) => v.mode === 'cooling' },
        { key: 'N1', label: 'Reading N₁', placeholder: '2000', show: (v) => v.mode === 'growth' && v.how === 'reading' },
        { key: 'half', label: 'Half-life / doubling time', placeholder: '1600', show: (v) => v.mode === 'growth' && v.how !== 'reading' },
        { key: 'L', label: 'L (henries)', placeholder: '0.5', show: (v) => v.mode === 'rl' || v.mode === 'lcr' },
        { key: 'R', label: 'R (ohms)', placeholder: '10', show: (v) => ['rl', 'rc', 'lcr'].includes(v.mode) },
        { key: 'C', label: 'C (farads)', placeholder: '0.01', show: (v) => v.mode === 'rc' || v.mode === 'lcr' },
        { key: 'E', label: 'E(t) (volts)', placeholder: '12 or 10 sin(t)', show: (v) => ['rl', 'rc', 'lcr'].includes(v.mode) },
        { key: 'q0', label: 'q(0)', placeholder: '0', show: (v) => v.mode === 'rc' || v.mode === 'lcr' },
        { key: 'i0', label: 'i(0)', placeholder: '0', show: (v) => v.mode === 'rl' || v.mode === 'lcr' },
        { key: 'at', label: 'Value at time t (optional)', placeholder: '40' },
        { key: 'target', label: 'Time to reach (optional)', placeholder: '30', show: (v) => v.mode === 'cooling' || v.mode === 'growth' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Times in any unit, used the same way throughout."}
      resultLabel={(a) => ({ cooling: 'Temperature', growth: 'Amount', rl: 'Current', rc: 'Charge', lcr: 'Charge' }[a.mode])}
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={a.law} /></div>{a.current && <div className="overflow-x-auto"><BlockMath math={a.current} /></div>}{a.atValue && <p className="font-mono">Value at that time: {a.atValue}</p>}{a.time && <p className="font-mono">Time to reach it: {a.time}</p>}{a.half && <p className="font-mono">Half-life: {a.half}</p>}{a.double && <p className="font-mono">Doubling time: {a.double}</p>}</div>)}
    />
  );
}
