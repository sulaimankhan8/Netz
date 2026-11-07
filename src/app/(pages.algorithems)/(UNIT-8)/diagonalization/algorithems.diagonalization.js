'use client';
// The live diagonalization calculator. The maths is in src/app/utils/engines/diagonalization.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MatrixMethodCalculator from '@/app/components/method/MatrixMethodCalculator';
import { solve } from '@/app/utils/engines/diagonalization';

const EXAMPLES = [
  { label: 'symmetric [[2,0,0],[0,3,4],[0,4,9]]', cells: [[2, 0, 0], [0, 3, 4], [0, 4, 9]] },
  { label: 'repeated λ (symmetric)', cells: [[6, -2, 2], [-2, 3, -1], [2, -1, 3]] },
  { label: '2×2 with A⁵', cells: [[4, 1], [2, 3]], extra: { power: '5' } },
  { label: 'not diagonalisable', cells: [[2, 1], [0, 2]] },
];

export default function Calculator() {
  return (
    <MatrixMethodCalculator
      id="diagonalization" title="Diagonalization Engine" button="Diagonalise" square min={2} max={4}
      start={[['2', '0', '0'], ['0', '3', '4'], ['0', '4', '9']]} examples={EXAMPLES} solve={solve}
      extraFields={[{ key: 'power', label: 'Also find Aᵏ for k = (optional)', placeholder: 'e.g. 5' }]} extraStart={{ power: '' }}
      hint="A square matrix, 2×2 to 4×4. Symmetric matrices also get the orthogonal reduction."
      resultLabel={(a) => (a.diagonalizable ? 'P⁻¹AP = D' : 'Not diagonalisable')}
      renderResult={(a) => (a.diagonalizable ? (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={`P = ${a.Ptex}, \\quad D = ${a.Dtex}`} /></div>
          {a.Ntex && <div className="overflow-x-auto"><BlockMath math={`N = ${a.Ntex} \\ (N^{T}AN = D)`} /></div>}
          {a.AkTex && <div className="overflow-x-auto"><BlockMath math={`A^{k} = ${a.AkTex}`} /></div>}
        </div>
      ) : <p className="font-mono">Not enough independent eigenvectors.</p>)}
    />
  );
}
