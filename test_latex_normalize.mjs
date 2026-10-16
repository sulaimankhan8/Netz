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

const { expandCompactLatex, showPlaceholders } = await import('./src/app/(Primary.pages)/Playground/utils/equations/latexNormalize.js');
const { evaluateLatexExpression } = await import('./src/app/(Primary.pages)/Playground/utils/latexEvaluator.js');
const { generateGraphDatasetFromLatex } = await import('./src/app/(Primary.pages)/Playground/utils/equationToGraph.js');

/**
 * LaTeX written by the visual equation editor (MathLive's short forms, \left( \right), \cdot)
 * is understood by the "=" answers and by graphs.
 */

let failed = 0;
let checks = 0;
function expect(name, condition, detail = '') {
  checks++;
  if (!condition) {
    failed++;
    console.error(`FAIL  ${name} ${detail}`);
  }
}
const eq = (name, got, want) => expect(name, got === want, `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

// ── Short forms written out ──────────────────────────────────────────────────
eq('\\frac12', expandCompactLatex('\\frac12'), '\\frac{1}{2}');
eq('\\frac1x', expandCompactLatex('\\frac1x'), '\\frac{1}{x}');
eq('one argument braced, one not', expandCompactLatex('\\frac{x+1}2'), '\\frac{x+1}{2}');
eq('a command as an argument', expandCompactLatex('\\frac\\pi2'), '\\frac{\\pi}{2}');
eq('\\sqrt2', expandCompactLatex('\\sqrt2'), '\\sqrt{2}');
eq('\\sqrt[3]8 keeps its index', expandCompactLatex('\\sqrt[3]8'), '\\sqrt[3]{8}');
eq('nested short forms', expandCompactLatex('\\frac{\\frac12}3'), '\\frac{\\frac{1}{2}}{3}');
eq('\\binom nk', expandCompactLatex('\\binom nk'), '\\binom{n}{k}');
eq('already braced is unchanged', expandCompactLatex('\\frac{1}{2}+\\sqrt{x}'), '\\frac{1}{2}+\\sqrt{x}');
eq('other commands are unchanged', expandCompactLatex('\\sin\\left(x\\right)+\\alpha\\cdot\\beta'), '\\sin\\left(x\\right)+\\alpha\\cdot\\beta');
eq('escaped braces are unchanged', expandCompactLatex('\\{x\\}+\\%'), '\\{x\\}+\\%');
eq('an unfinished fraction is left as typed', expandCompactLatex('x+\\frac1'), 'x+\\frac1');
eq('a fraction inside a root', expandCompactLatex('\\sqrt{\\frac14}'), '\\sqrt{\\frac{1}{4}}');
eq('empty', expandCompactLatex(''), '');

// ── Empty boxes left in a template ───────────────────────────────────────────
eq('an empty box shows as a square', showPlaceholders('x=\\placeholder{}'), 'x=\\square');
eq('a filled box shows what is in it', showPlaceholders('\\placeholder{2}+1'), '{2}+1');
eq('a named box', showPlaceholders('\\placeholder[a]{}'), '\\square');
eq('every box in a matrix', showPlaceholders('\\begin{bmatrix}\\placeholder{} & \\placeholder{}\\end{bmatrix}'), '\\begin{bmatrix}\\square & \\square\\end{bmatrix}');
eq('no boxes: unchanged', showPlaceholders('\\frac{1}{2}'), '\\frac{1}{2}');

// ── "=" answers on editor output ─────────────────────────────────────────────
eq('\\frac12+\\frac14=', String(evaluateLatexExpression(expandCompactLatex('\\frac12+\\frac14='))), '0.75');
eq('2\\cdot\\left(3+4\\right)=', String(evaluateLatexExpression(expandCompactLatex('2\\cdot\\left(3+4\\right)='))), '14');
eq('\\sqrt{16}=', String(evaluateLatexExpression(expandCompactLatex('\\sqrt{16}='))), '4');

// ── Graphs of editor output ──────────────────────────────────────────────────
const valueAt = (latex, x) => {
  const d = generateGraphDatasetFromLatex(expandCompactLatex(latex));
  const p = d && d.data.find((q) => Math.abs(q.x - x) < 1e-9);
  return p ? p.y : null;
};
eq('y=x^2-4x+3 at x=1', valueAt('y=x^2-4x+3', 1), 0);
eq('y=\\frac12x^2 at x=2', valueAt('y=\\frac12x^2', 2), 2);
eq('y=\\sin\\left(x\\right) at x=0', valueAt('y=\\sin\\left(x\\right)', 0), 0);
eq('y=2\\cdot x+1 at x=3', valueAt('y=2\\cdot x+1', 3), 7);
eq('y=\\sqrt{x} at x=4', valueAt('y=\\sqrt{x}', 4), 2);
eq('y=\\frac{x+1}2 at x=3', valueAt('y=\\frac{x+1}2', 3), 2);

console.log(`${checks - failed}/${checks} checks passed`);
process.exit(failed ? 1 : 0);
