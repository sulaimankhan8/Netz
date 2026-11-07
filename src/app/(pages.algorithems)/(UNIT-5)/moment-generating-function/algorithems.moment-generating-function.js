'use client';
// The live moment generating function calculator. The maths is in src/app/utils/engines/mgf.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/mgf';

const EXAMPLES = [
  {
    label: "Binomial(10, 0.3)",
    input: {
      dist: "binomial",
      n: "10",
      p: "0.3"
    }
  },
  {
    label: "Poisson(2)",
    input: {
      dist: "poisson",
      lambda: "2"
    }
  },
  {
    label: "Uniform(0, 1)",
    input: {
      dist: "uniform",
      a: "0",
      b: "1"
    }
  },
  {
    label: "Normal(5, 2)",
    input: {
      dist: "normal",
      mu: "5",
      sigma: "2"
    }
  },
  {
    label: "table: 0, 1, 2 with ¼, ½, ¼",
    input: {
      dist: "custom",
      xs: "0, 1, 2",
      ps: "1/4, 1/2, 1/4"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="mgf" unit={5} title="MGF Engine" button="Find the MGF"
      start={{
  dist: "binomial",
  n: "10",
  p: "0.3",
  lambda: "2",
  a: "0",
  b: "1",
  mu: "0",
  sigma: "1",
  alpha: "2",
  theta: "3",
  xs: "0, 1, 2",
  ps: "1/4, 1/2, 1/4"
}}
      fields={[
        { key: 'dist', label: 'Distribution', kind: 'select', options: [['binomial', 'Binomial'], ['poisson', 'Poisson'], ['geometric', 'Geometric'], ['exponential', 'Exponential'], ['uniform', 'Uniform'], ['normal', 'Normal'], ['gamma', 'Gamma'], ['custom', 'Your own (discrete table)']].map(([value, label]) => ({ value, label })) },
        { key: 'n', label: 'n', show: (v) => v.dist === 'binomial' }, { key: 'p', label: 'p', show: (v) => ['binomial', 'geometric'].includes(v.dist) },
        { key: 'lambda', label: 'λ', show: (v) => ['poisson', 'exponential'].includes(v.dist) },
        { key: 'a', label: 'a', show: (v) => v.dist === 'uniform' }, { key: 'b', label: 'b', show: (v) => v.dist === 'uniform' },
        { key: 'mu', label: 'μ', show: (v) => v.dist === 'normal' }, { key: 'sigma', label: 'σ', show: (v) => v.dist === 'normal' },
        { key: 'alpha', label: 'α (shape)', show: (v) => v.dist === 'gamma' }, { key: 'theta', label: 'θ (scale)', show: (v) => v.dist === 'gamma' },
        { key: 'xs', label: 'Values x', placeholder: '0, 1, 2', show: (v) => v.dist === 'custom' }, { key: 'ps', label: 'Probabilities', placeholder: '1/4, 1/2, 1/4', show: (v) => v.dist === 'custom' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Moments come from derivatives of M(t) at t = 0."
      resultLabel={(a) => a.name}
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto text-lg"><BlockMath math={`M(t) = ${a.M}`} /></div><div className="overflow-x-auto"><BlockMath math={`\\mu = ${a.mean}, \\quad E[X^2] = ${a.m2}, \\quad \\sigma^2 = ${a.variance}`} /></div></div>)}
    />
  );
}
