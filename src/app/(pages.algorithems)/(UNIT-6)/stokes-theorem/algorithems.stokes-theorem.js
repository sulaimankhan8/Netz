'use client';
// The live Stokes' theorem calculator. The maths is in src/app/utils/engines/stokes-theorem.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/stokes-theorem';

const EXAMPLES = [
  {
    label: "Rectangle: (x² + y², −2xy, 0)",
    input: {
      P: "x^2 + y^2",
      Q: "-2xy",
      R: "0",
      surface: "rectangle",
      xlo: "0",
      xhi: "2",
      ylo: "0",
      yhi: "3",
      c: "0"
    }
  },
  {
    label: "Hemisphere: (y, z, x)",
    input: {
      P: "y",
      Q: "z",
      R: "x",
      surface: "hemisphere",
      a: "1"
    }
  },
  {
    label: "Disc: (−y³, x³, z)",
    input: {
      P: "-y^3",
      Q: "x^3",
      R: "z",
      surface: "disc",
      a: "1",
      c: "0"
    }
  },
  {
    label: "Triangle in x + y + z = 1",
    input: {
      P: "y",
      Q: "z",
      R: "x",
      surface: "triangle",
      ia: "1",
      ib: "1",
      ic: "1"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="stokes-theorem" unit={6} title="Stokes' Theorem Engine" button="Verify"
      start={{
  P: "x^2 + y^2",
  Q: "-2xy",
  R: "0",
  surface: "rectangle",
  xlo: "0",
  xhi: "2",
  ylo: "0",
  yhi: "3",
  c: "0",
  a: "1",
  ia: "1",
  ib: "1",
  ic: "1"
}}
      fields={[
        { key: 'P', label: 'P (i part)', placeholder: 'x' }, { key: 'Q', label: 'Q (j part)', placeholder: 'y' }, { key: 'R', label: 'R (k part)', placeholder: 'z' },
        { key: 'surface', label: 'Surface', kind: 'select', options: [{ value: 'rectangle', label: "Rectangle in z = c" }, { value: 'disc', label: "Disc z = h" }, { value: 'hemisphere', label: "Upper hemisphere" }, { value: 'triangle', label: "Plane x/a + y/b + z/c = 1" }] },
        { key: 'xlo', label: 'x from', placeholder: '0', show: (v) => v.surface === 'rectangle' }, { key: 'xhi', label: 'x to', placeholder: '2', show: (v) => v.surface === 'rectangle' },
        { key: 'ylo', label: 'y from', placeholder: '0', show: (v) => v.surface === 'rectangle' }, { key: 'yhi', label: 'y to', placeholder: '3', show: (v) => v.surface === 'rectangle' },
        { key: 'c', label: 'The plane z =', placeholder: '0', show: (v) => v.surface === 'rectangle' || v.surface === 'disc' },
        { key: 'a', label: 'Radius a', placeholder: '1', show: (v) => v.surface === 'disc' || v.surface === 'hemisphere' },
        { key: 'ia', label: 'x-intercept a', placeholder: '1', show: (v) => v.surface === 'triangle' }, { key: 'ib', label: 'y-intercept b', placeholder: '1', show: (v) => v.surface === 'triangle' }, { key: 'ic', label: 'z-intercept c', placeholder: '1', show: (v) => v.surface === 'triangle' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"The edge is taken anticlockwise seen from above (the normal points up or out)."}
      resultLabel="Both sides"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`\\oint_C \\mathbf{F}\\cdot d\\mathbf{r} = ${a.line}`} /></div><div className="overflow-x-auto"><BlockMath math={`\\iint_S (\\nabla \\times \\mathbf{F})\\cdot\\mathbf{n}\\,dS = ${a.surface}`} /></div></div>)}
    />
  );
}
