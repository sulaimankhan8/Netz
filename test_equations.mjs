import katex from 'katex';
import 'katex/contrib/mhchem';
import { STRUCTURES, SYMBOL_PALETTES, templatePreview, allTemplates } from './src/app/(Primary.pages)/Playground/utils/equations/equationTemplates.js';
import { COMMON_EQUATIONS, usesChemistry } from './src/app/(Primary.pages)/Playground/utils/equations/commonEquations.js';

/**
 * Insert > Equation data: every ribbon template and every common equation is valid LaTeX for
 * KaTeX (chemistry through mhchem), and the ribbon has Word's structure groups.
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
const renders = (latex) => {
  try {
    // strict: 'ignore', as on screen: symbols outside KaTeX's own tables still draw, without a warning each
    katex.renderToString(latex, { throwOnError: true, displayMode: true, strict: 'ignore' });
    return null;
  } catch (err) {
    return err.message;
  }
};

expect('the ribbon has Word\'s 11 structures in order', STRUCTURES.map((s) => s.label).join('|') === 'Fraction|Script|Radical|Integral|Large Operator|Bracket|Function|Accent|Limit and Log|Operator|Matrix', STRUCTURES.map((s) => s.label).join('|'));
const templates = allTemplates();
expect('about a hundred templates', templates.length >= 90, templates.length);
const badTemplates = templates.map((t) => [t.name, renders(templatePreview(t.latex))]).filter(([, e]) => e);
expect('every template preview renders', badTemplates.length === 0, JSON.stringify(badTemplates.slice(0, 3)));
expect('every structure icon renders', STRUCTURES.every((s) => !renders(s.icon)), STRUCTURES.filter((s) => renders(s.icon)).map((s) => s.id).join(','));
expect('templates with boxes have #? placeholders', templates.filter((t) => t.latex.includes('#?')).length >= 60);
expect('template names are unique', new Set(templates.map((t) => t.name)).size === templates.length, templates.length - new Set(templates.map((t) => t.name)).size);
expect('a stacked fraction has two boxes', templates.find((t) => t.name === 'Stacked Fraction').latex === '\\frac{#?}{#?}');
expect('the preview shows boxes as squares', templatePreview('\\frac{#?}{#?}') === '\\frac{\\square}{\\square}');

expect('8 symbol palettes', SYMBOL_PALETTES.length === 8 && SYMBOL_PALETTES[0].label === 'Basic Math');
const badSymbols = SYMBOL_PALETTES.flatMap((p) => [...p.symbols].filter((c) => renders(c)));
expect('every palette symbol renders in KaTeX', badSymbols.length === 0, badSymbols.slice(0, 10).join(' '));

expect('Common Equations: Math, Physics, Chemistry', COMMON_EQUATIONS.map((c) => c.label).join('|') === 'Math|Physics|Chemistry');
expect('Math starts with WPS\'s order', COMMON_EQUATIONS[0].items.slice(0, 8).map((i) => i.name).join('|') === 'Quadratic Formula|Binomial Theorem|Pythagorean Theorem|Law of Sines|Law of Cosines|Circumference of a Circle|Trig Identity 1|Trig Identity 2');
const badEquations = COMMON_EQUATIONS.flatMap((c) => c.items.map((i) => [i.name, renders(i.latex)])).filter(([, e]) => e);
expect('every common equation renders (chemistry through mhchem)', badEquations.length === 0, JSON.stringify(badEquations.slice(0, 3)));
expect('chemistry equations are recognised as such', COMMON_EQUATIONS[2].items.every((i) => usesChemistry(i.latex)) && !usesChemistry('x^2'));

console.log(`${checks - failed}/${checks} checks passed`);
process.exit(failed ? 1 : 0);
