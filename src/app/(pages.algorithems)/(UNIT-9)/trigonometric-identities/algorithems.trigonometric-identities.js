'use client';
// The live trig identity calculator. The maths is in src/app/utils/engines/trig-identities.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/trig-identities';

const EXAMPLES = [
  {
    label: "tan x + cot x = sec x csc x",
    input: {
      identity: "tan(x) + cot(x) = sec(x) csc(x)"
    }
  },
  {
    label: "(1 − cos 2x)/sin 2x = tan x",
    input: {
      identity: "(1 - cos(2x))/sin(2x) = tan(x)"
    }
  },
  {
    label: "sin⁴x − cos⁴x = sin²x − cos²x",
    input: {
      identity: "sin(x)^4 - cos(x)^4 = sin(x)^2 - cos(x)^2"
    }
  },
  {
    label: "(1 + sin x)/cos x = cos x/(1 − sin x)",
    input: {
      identity: "(1 + sin(x))/cos(x) = cos(x)/(1 - sin(x))"
    }
  },
  {
    label: "sin 3x = 3 sin x − 4 sin³x",
    input: {
      identity: "sin(3x) = 3sin(x) - 4sin(x)^3"
    }
  },
  {
    label: "not an identity: sin 2x = 2 sin x",
    input: {
      identity: "sin(2x) = 2sin(x)"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="trig-identities" unit={9} title="Identity Checker" button="Prove"
      start={{
  identity: "tan(x) + cot(x) = sec(x) csc(x)"
}}
      fields={[{ key: 'identity', label: 'Identity (use x for the angle)', placeholder: 'tan(x) + cot(x) = sec(x) csc(x)', wide: true }]}
      examples={EXAMPLES} solve={solve}
      hint="Write powers as sin(x)^2. Both sides are checked at many angles first."
      resultLabel={(a) => (a.holds ? (a.proved ? 'Identity proved' : 'True (checked numerically)') : 'Not an identity')}
      renderResult={(a) => <p className="text-2xl font-black">{a.holds ? (a.proved ? '✓ True for every x where both sides are defined' : '✓ True (checked at many angles)') : '✗ False'}</p>}
    />
  );
}
