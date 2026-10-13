import { register } from 'node:module';

// The Playground utils use extensionless relative imports (resolved by the Next.js bundler).
// This hook lets plain Node resolve them the same way.
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
        try {
          return await next(specifier, context);
        } catch (err) {
          if (specifier.startsWith('.') && !/\\.[cm]?js$/.test(specifier)) {
            return next(specifier + '.js', context);
          }
          throw err;
        }
      }
    `)
);

const { evaluateLatexExpression, latexToEvaluableExpression } = await import(
  './src/app/(Primary.pages)/Playground/utils/latexEvaluator.js'
);
const { scopeManager } = await import('./src/app/(Primary.pages)/Playground/utils/scopeManager.js');

// [input, expected result]
const cases = [
  // Plain arithmetic
  ['3+4=', '7'],
  ['24*5=', '120'],
  ['24 * 5 =', '120'],
  // HMER output: one token per digit, joined with spaces
  ['2 4\\times 5=', '120'],
  ['1 2 0\\div 5=', '24'],
  ['3 . 5+1 . 5=', '5'],
  ['2 4+5=', '29'],
  // LaTeX structure
  ['\\frac{3}{4}+2=', '2.75'],
  ['\\frac{1}{2}+\\frac{1}{4}=', '0.75'],
  ['2^{1 0}=', '1024'],
  ['\\sqrt{1 6}=', '4'],
  ['\\sqrt{9}+\\sqrt{1 6}=', '7'],
  ['3\\cdot 4=', '12'],
  ['\\left(2+3\\right)\\times 4=', '20'],
  ['2(3+4)=', '14'],
  ['\\frac{2^{3}}{4}=', '2'],
  ['\\frac{\\sqrt{1 6}}{2}=', '2'],
  ['\\frac{1}{\\frac{1}{2}}=', '2'],
  ['\\sqrt{\\frac{9}{4}}=', '1.5'],
  ['\\sin(0)+\\cos(0)=', '1'],
  ['\\pi\\times 2=', '6.283185307'],
  ['2 0\\%\\times 5 0=', '10'],
  // Symbol-matcher / typed fallbacks
  ['7 × 6 =', '42'],
  ['9 ÷ 3 =', '3'],
  // Floating point noise is hidden
  ['0.1+0.2=', '0.3'],
  ['1\\div 3=', '0.3333333333'],
  // Right-most side of a chained equation
  ['y=2+3=', '5'],
  // Not evaluable -> null
  ['x^{2}+1=', null],
  ['2x+3=', null],
  ['\\alpha+1=', null],
  ['1\\div 0=', null],
  ['3+4', null],
  ['=', null],
  ['', null],
];

let failed = 0;
for (const [input, expected] of cases) {
  const actual = evaluateLatexExpression(input);
  if (actual !== expected) {
    failed++;
    console.error(
      `FAIL  ${JSON.stringify(input)}  expected ${JSON.stringify(expected)}  got ${JSON.stringify(actual)}  (expr: ${JSON.stringify(latexToEvaluableExpression(input))})`
    );
  }
}

// Variables defined in Equation Blocks are picked up from the shared CAS scope
scopeManager.setSymbol('a', 5);
const scoped = [
  ['2a+1=', '11'],
  ['a^{2}=', '25'],
];
for (const [input, expected] of scoped) {
  const actual = evaluateLatexExpression(input);
  if (actual !== expected) {
    failed++;
    console.error(`FAIL (scope a=5)  ${JSON.stringify(input)}  expected ${expected}  got ${JSON.stringify(actual)}`);
  }
}
scopeManager.clear();

const total = cases.length + scoped.length;
if (failed > 0) {
  console.error(`\n ${failed}/${total} evaluator cases FAILED`);
  process.exit(1);
}
console.log(`\n SUCCESS: All ${total}/${total} "=" evaluator cases passed!`);
