'use client';
// The live linear PDE calculator. The maths is in src/app/utils/engines/pde-constant-coefficients.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/pde-constant-coefficients';

const EXAMPLES = [
  {
    label: "(D² − 5DD′ + 6D′²)z = e^(x+y)",
    input: {
      eq: "(D^2 - 5DD' + 6D'^2)z = e^(x + y)"
    }
  },
  {
    label: "(D² − 2DD′ + D′²)z = e^(x+y)",
    input: {
      eq: "(D^2 - 2DD' + D'^2)z = e^(x + y)"
    }
  },
  {
    label: "(D² + DD′ − 6D′²)z = cos(2x + y)",
    input: {
      eq: "(D^2 + DD' - 6D'^2)z = cos(2x + y)"
    }
  },
  {
    label: "r − s − 6t = xy",
    input: {
      eq: "r - s - 6t = xy"
    }
  },
  {
    label: "z_xx − z_yy = x − y",
    input: {
      eq: "z_xx - z_yy = x - y"
    }
  },
  {
    label: "(D² − 2DD′ + D′²)z = tan(x + y)",
    input: {
      eq: "(D^2 - 2DD' + D'^2)z = tan(x + y)"
    }
  },
  {
    label: "(D³ − 3D²D′ + 4D′³)z = e^(x+2y)",
    input: {
      eq: "(D^3 - 3D^2 D' + 4D'^3)z = e^(x + 2y)"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="pde-constant-coefficients" unit={12} title="Linear PDE Engine" button="Solve"
      start={{
  eq: "(D^2 - 5DD' + 6D'^2)z = e^(x + y)"
}}
      fields={[
        { key: 'eq', label: "f(D, D′)z = F(x, y)", placeholder: "(D^2 - 2DD' + D'^2)z = e^(x + y)", wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"D = ∂/∂x, D′ = ∂/∂y. Also r, s, t or z_xx, z_xy, z_yy."}
      resultLabel="CF + PI"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={a.answer} /></div>}
    />
  );
}
