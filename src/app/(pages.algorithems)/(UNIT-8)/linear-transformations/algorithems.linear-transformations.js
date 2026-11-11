'use client';
// The live linear transformation calculator. The maths is in src/app/utils/engines/linear-transformations.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/linear-transformations';

const EXAMPLES = [
  {
    label: "T(x, y, z) = (x + 2y − z, y + z, x + y − 2z)",
    input: {
      mode: "formula",
      formula: "T(x, y, z) = (x + 2y - z, y + z, x + y - 2z)"
    }
  },
  {
    label: "T(x, y) = (x + y, x − y)",
    input: {
      mode: "formula",
      formula: "T(x, y) = (x + y, x - y)"
    }
  },
  {
    label: "Projection T(x, y, z) = (x, y)",
    input: {
      mode: "formula",
      formula: "T(x, y, z) = (x, y)"
    }
  },
  {
    label: "Matrix [1 2 3; 2 4 6]",
    input: {
      mode: "matrix",
      A: "1 2 3; 2 4 6"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="linear-transformations" unit={8} title="Linear Transformation Engine" button="Analyse"
      start={{
  mode: "formula",
  A: "",
  formula: "T(x, y, z) = (x + 2y - z, y + z, x + y - 2z)"
}}
      fields={[
        { key: 'mode', label: 'Give T by', kind: 'choice', options: [{ value: 'formula', label: "A formula" }, { value: 'matrix', label: "Its matrix" }] },
        { key: 'formula', label: 'T(…) = (…)', placeholder: 'T(x, y, z) = (x + y, y - z)', wide: true, show: (v) => v.mode === 'formula' },
        { key: 'A', label: 'Matrix A (rows separated by ;)', placeholder: '1 2 3; 2 4 6', wide: true, show: (v) => v.mode === 'matrix' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"T: Rⁿ → Rᵐ; the matrix has T(eⱼ) as its j-th column."}
      resultLabel="Kernel and image"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`\\text{rank} = ${a.rank}, \\quad \\text{nullity} = ${a.nullity}`} /></div>{a.kernel.length > 0 ? <div className="overflow-x-auto"><BlockMath math={`\\ker T = \\operatorname{span}\\{${a.kernel.join(',\\ ')}\\}`} /></div> : <div className="overflow-x-auto"><BlockMath math={`\\ker T = \\{\\mathbf{0}\\}`} /></div>}</div>)}
    />
  );
}
