// Group 3K: truth tables, modular arithmetic and RSA, Dijkstra, BFS/DFS, minimum spanning trees, the simplex method.
// Textbook answers (Rosen ch. 1, 4, 10–11; Taha ch. 3–4). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as truth } from '../../src/app/utils/engines/truth-table.js';
import { solve as mod } from '../../src/app/utils/engines/modular-arithmetic.js';
import { dijkstra, bfsDfs, mst } from '../../src/app/utils/engines/graphs.js';
import { solve as simplex } from '../../src/app/utils/engines/simplex.js';

const err = (fn, re) => assert.throws(fn, (e) => e.name === 'EngineError' && re.test(e.message));
const GRAPH = 'A B 4; A C 2; B C 1; B D 5; C D 8; C E 10; D E 2; D F 6; E F 2';

test('Truth tables: tautology, contradiction, equivalence', () => {
  assert.equal(truth({ f: '(p → q) ∧ p → q', g: '' }).verdict, 'tautology');
  assert.equal(truth({ f: 'p ∧ ¬p', g: '' }).verdict, 'contradiction');
  assert.equal(truth({ f: 'p → q', g: '¬p ∨ q' }).equivalent, true);
  assert.equal(truth({ f: '¬(p ∧ q)', g: '¬p ∨ ¬q' }).equivalent, true); // De Morgan
  assert.equal(truth({ f: 'p → q', g: 'q → p' }).equivalent, false);
  assert.equal(truth({ f: '(p ∨ q) ∧ (¬p ∨ r) → (q ∨ r)', g: '' }).verdict, 'tautology'); // resolution
});

test('Modular arithmetic: gcd, Bézout, inverse, powers, congruences, RSA', () => {
  assert.equal(mod({ mode: 'gcd', a: '252', b: '198' }).answer, '\\gcd(252, 198) = 18');
  assert.equal(mod({ mode: 'bezout', a: '240', b: '46' }).answer, '2 = (-9)(240) + (47)(46)');
  assert.equal(mod({ mode: 'inverse', a: '7', m: '26' }).answer, '7^{-1} \\equiv 15 \\pmod{26}');
  assert.equal(mod({ mode: 'power', a: '3', b: '200', m: '13' }).answer, '3^{200} \\equiv 9 \\pmod{13}');
  assert.equal(mod({ mode: 'congruence', a: '6', b: '4', m: '10' }).answer, 'x \\equiv 4 \\pmod{5}');
  assert.match(mod({ mode: 'rsa', p: '61', q: '53', e: '17', msg: '65' }).answer, /\(3233, 17\).*d = 2753.*65 \\to 2790 \\to 65/);
  err(() => mod({ mode: 'inverse', a: '4', m: '26' }), /no inverse|not coprime|gcd/i);
});

test("Dijkstra's shortest paths", () => {
  const to = (r, n) => r.paths.find((p) => p.to === n);
  const r = dijkstra({ edges: GRAPH, source: 'A', directed: 'no' });
  assert.equal(to(r, 'F').d, '12'); assert.equal(to(r, 'F').path, 'A → C → B → D → E → F');
  assert.equal(to(r, 'D').d, '8'); assert.equal(r.verified, true);
  const d = dijkstra({ edges: 'S A 10; S B 5; B A 3; A C 1; B C 9; B D 2; D C 6; C D 4', source: 'S', directed: 'yes', target: 'C' });
  assert.equal(to(d, 'C').d, '9'); assert.equal(to(d, 'C').path, 'S → B → A → C');
  err(() => dijkstra({ edges: 'A B -1', source: 'A', directed: 'no' }), /negative/i);
});

test('BFS and DFS visiting orders', () => {
  const g = 'A B; A C; B D; B E; C F; E F; D G';
  assert.deepEqual(bfsDfs({ edges: g, start: 'A', mode: 'bfs', directed: 'no' }).order, ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  assert.deepEqual(bfsDfs({ edges: g, start: 'A', mode: 'dfs', directed: 'no' }).order, ['A', 'B', 'D', 'G', 'E', 'F', 'C']);
});

test("Minimum spanning tree: Kruskal and Prim agree", () => {
  assert.equal(mst({ edges: GRAPH, mode: 'kruskal' }).total, 12);
  assert.equal(mst({ edges: GRAPH, mode: 'prim', start: 'A' }).total, 12);
  assert.equal(mst({ edges: 'P Q 3; P R 1; P S 6; Q R 5; Q T 3; R S 5; R T 6; S T 2', mode: 'kruskal' }).total, 9);
  // a negative weight is fine for a spanning tree ("A-B" still joins A and B)
  assert.equal(mst({ edges: 'A-B -2; B C 3; A C 1', mode: 'kruskal' }).total, -1);
});

test('Simplex method: maximise, minimise (Big-M), and the dual', () => {
  const a = simplex({ mode: 'simplex', objective: 'max 3x + 5y', constraints: 'x <= 4; 2y <= 12; 3x + 2y <= 18' });
  assert.equal(a.answer, 'x = 2, \\ y = 6, \\quad z_{\\text{max}} = 36');
  assert.ok(!a.answer.includes('\t'));
  assert.match(simplex({ mode: 'simplex', objective: 'max 5x + 4y', constraints: '6x + 4y <= 24; x + 2y <= 6; y - x <= 1; y <= 2' }).answer, /z_\{\\text\{max\}\} = 21$/);
  assert.equal(simplex({ mode: 'simplex', objective: 'min 2x + 3y', constraints: 'x + y >= 4; x + 3y >= 6' }).answer, 'x = 3, \\ y = 1, \\quad z_{\\text{min}} = 9');
  assert.equal(simplex({ mode: 'dual', objective: 'max 3x + 5y', constraints: 'x <= 4; 2y <= 12; 3x + 2y <= 18' }).answer, '\\min\\ w = 4y_{1} + 12y_{2} + 18y_{3}');
});
