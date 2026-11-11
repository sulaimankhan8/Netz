/**
 * Code export for the algorithm pages: DFT and FFT, harmonic analysis (Units 13 and 6), truth tables,
 * modular arithmetic and RSA, Dijkstra, BFS and DFS, minimum spanning trees and the simplex method (Unit 15).
 * `raw` is what the page passes to its engine; the engine checks the inputs first.
 */

import { evaluate } from 'mathjs';
import { solve as dftSolve } from '../engines/dft-fft.js';
import { solve as harmonicSolve } from '../engines/harmonic-analysis.js';
import { solve as truthSolve } from '../engines/truth-table.js';
import { solve as modSolve } from '../engines/modular-arithmetic.js';
import { solve as dijkstraSolve } from '../engines/dijkstra.js';
import { solve as searchSolve } from '../engines/bfs-dfs.js';
import { solve as mstSolve } from '../engines/mst.js';
import { solve as simplexSolve } from '../engines/simplex.js';
import { D, S, FOR, WHILE, IF, P, C, BREAK, num, int, lit, normal, choice, ExportError } from './kit.js';

function check(solve, raw) {
  try {
    return solve(raw);
  } catch (e) {
    throw new ExportError(e?.message || 'Please check the inputs.');
  }
}

/** One print per name: prints `before + name of node (expr) + after`, choosing the name at run time. */
const sayNode = (names, expr, before = '', after = '') => names.map((nm, i) => IF(`${expr} == ${i}`, [P(`${before}${nm}${after}`)]));

/** Edges "A B 4; A C 2" → names (sorted like the page) and [u, v, w] index triples. */
function graphOf(text, weighted = true) {
  const parts = String(text ?? '').split(/[;\n]+/).map((s) => s.trim()).filter(Boolean);
  const raw = parts.map((p) => {
    const t = p.split(/[\s,]+/).filter(Boolean);
    return { u: t[0], v: t[1], w: weighted && t.length === 3 ? Number(t[2]) : 1 };
  });
  const names = [...new Set(raw.flatMap((e) => [e.u, e.v]))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (names.length > 26) throw new ExportError('Code export takes up to 26 nodes.');
  return { names, edges: raw.map((e) => [names.indexOf(e.u), names.indexOf(e.v), e.w]), rawEdges: raw };
}

/** Big-M simplex data for "max/min ..." and "a <= b; ..." lines (numbers worked out here, the method in the program). */
function lpOf(objective, constraints) {
  const obj = String(objective ?? '').trim().match(/^(max|min)\w*\s*[:=]?\s*(?:z\s*=\s*)?(.+)$/i);
  if (!obj) throw new ExportError('Write the objective as "max 3x + 5y" or "min 2x + y".');
  const cons = String(constraints ?? '').split(/[;\n]+/).map((s) => s.trim()).filter(Boolean)
    .filter((s) => !/^[a-z](\s*,\s*[a-z])*\s*>=\s*0$/i.test(s.replace(/≥/g, '>=')));
  const parsed = cons.map((c) => {
    const m = c.replace(/≤/g, '<=').replace(/≥/g, '>=').match(/^(.+?)(<=|>=|=)(.+)$/);
    if (!m) throw new ExportError(`Write each constraint with <=, >= or = (could not read "${c}").`);
    return { lhs: normal(m[1], 'a constraint'), op: m[2], rhs: Number(evaluate(m[3])) };
  });
  const objExpr = normal(obj[2], 'the objective');
  const letters = (e) => (e.match(/\b[a-z]\w*\b/gi) || []).filter((w) => !['e', 'pi'].includes(w));
  const vars = [...new Set([...letters(objExpr), ...parsed.flatMap((q) => letters(q.lhs))])].sort();
  const coefs = (e) => {
    const at = (pt) => Number(evaluate(e, Object.fromEntries(vars.map((v, i) => [v, pt[i]]))));
    const zero = at(vars.map(() => 0));
    return { c: vars.map((_, j) => at(vars.map((__, k) => (k === j ? 1 : 0))) - zero), k: zero };
  };
  const rows = parsed.map((q) => {
    const { c, k } = coefs(q.lhs);
    let a = c;
    let b = q.rhs - k;
    let op = q.op;
    if (b < 0) { a = a.map((x) => -x); b = -b; op = op === '<=' ? '>=' : op === '>=' ? '<=' : '='; }
    return { a, b, op };
  });
  return { sense: obj[1].toLowerCase(), vars, c: coefs(objExpr).c, rows };
}

/* ---------------- truth tables: formula → boolean expression for the program ---------------- */

const OPS = { '¬': 5, '∧': 4, '∨': 3, '⊕': 2, '→': 1, '↔': 0 };
function tokens(src) {
  const s = String(src ?? '')
    .replace(/<->|<=>|\biff\b/gi, '↔').replace(/->|=>|\bimplies\b/gi, '→').replace(/\bxor\b/gi, '⊕')
    .replace(/\band\b|&&|&|\^|·/gi, '∧').replace(/\bor\b|\|\||\||\+/gi, '∨').replace(/\bnot\b|~|!|¬/gi, '¬');
  const out = [];
  for (const ch of s.replace(/\s+/g, '')) {
    if ('¬∧∨⊕→↔()'.includes(ch) || /[a-zA-Z]/.test(ch)) out.push(ch);
    else if (ch === '1') out.push('T');
    else if (ch === '0') out.push('F');
    else throw new ExportError(`"${ch}" is not a connective or a letter.`);
  }
  return out;
}
function toBool(src) {
  const t = tokens(src);
  let i = 0;
  const primary = () => {
    const tok = t[i++];
    if (tok === '(') { const e = expr(0); i++; return e; }
    if (tok === '¬') return `(not ${primary()})`;
    if (tok === 'T') return 'true';
    if (tok === 'F') return 'false';
    return `b${tok}`;
  };
  const expr = (minPrec) => {
    let left = primary();
    while (t[i] && t[i] in OPS && t[i] !== '¬' && OPS[t[i]] >= minPrec) {
      const op = t[i++];
      const right = expr(op === '→' ? OPS[op] : OPS[op] + 1);
      left = { '∧': `(${left} and ${right})`, '∨': `(${left} or ${right})`, '⊕': `(${left} != ${right})`, '→': `((not ${left}) or ${right})`, '↔': `(${left} == ${right})` }[op];
    }
    return left;
  };
  return expr(0);
}
const lettersIn = (src) => [...new Set(tokens(src).filter((c) => /^[a-zA-Z]$/.test(c) && c !== 'T' && c !== 'F'))];

/* ---------------- programs ---------------- */

export const EXPORTS = {
  'dft-fft': {
    name: 'DFT and FFT',
    clean: (raw) => {
      check(dftSolve, raw);
      const parts = String(raw.x ?? '').split(/[,;]+|\s+(?=[-+]?\d)/).map((s) => s.trim()).filter(Boolean);
      const zs = parts.map((p) => {
        const v = evaluate(p.replace(/−/g, '-').replace(/j/g, 'i').replace(/√/g, 'sqrt'));
        return typeof v === 'number' ? [v, 0] : [v.re, v.im];
      });
      return { mode: choice(raw.mode, ['fft', 'dft', 'idft']), re: zs.map((z) => z[0]), im: zs.map((z) => z[1]) };
    },
    program: (p) => {
      const inv = p.mode === 'idft';
      return {
        title: inv ? 'Inverse DFT' : p.mode === 'fft' ? 'Discrete Fourier transform (the FFT gives the same numbers)' : 'Discrete Fourier transform',
        about: [inv ? 'x(n) = (1/N) sum of X(k) e^(+2 pi i k n / N)' : 'X(k) = sum of x(n) e^(-2 pi i k n / N)', ...(p.mode === 'fft' ? ['Written as the direct sum: the radix-2 FFT reorders this work but gives the same result'] : [])],
        body: [
          D('N', 'int', String(p.re.length)),
          D('xr', 'vec', { vec: p.re }), D('xi', 'vec', { vec: p.im }),
          FOR('k', 0, 'N', [
            D('sr', 'num', '0'), D('si', 'num', '0'),
            FOR('t', 0, 'N', [
              D('ang', 'num', `${inv ? '' : '-'}2 * pi * k * t / N`),
              S('sr', 'sr + xr[t] * cos(ang) - xi[t] * sin(ang)'),
              S('si', 'si + xr[t] * sin(ang) + xi[t] * cos(ang)'),
            ]),
            ...(inv ? [S('sr', 'sr / N'), S('si', 'si / N')] : []),
            IF('abs(sr) < 1e-12', [S('sr', '0')]), IF('abs(si) < 1e-12', [S('si', '0')]),
            P(`${inv ? 'x' : 'X'}(`, int('k'), ') = ', num('sr', 6), ' + ', num('si', 6), ' i,  magnitude ', num('sqrt(sr * sr + si * si)', 6)),
          ]),
        ],
      };
    },
  },

  'harmonic-analysis': {
    name: 'Harmonic analysis',
    clean: (raw) => {
      check(harmonicSolve, raw);
      const ys = String(raw.y ?? '').split(/[,;\s]+/).filter(Boolean).map(Number);
      return { ys, K: Math.min(Number(raw.harmonics) || 3, Math.floor(ys.length / 2)) };
    },
    program: (p) => ({
      title: 'Harmonic analysis: Fourier coefficients from values over one period',
      about: ['a0 = (2/N) sum y, a_k = (2/N) sum y cos(k theta), b_k = (2/N) sum y sin(k theta), theta_i = 2 pi i / N', 'y ~ a0/2 + sum of (a_k cos k theta + b_k sin k theta)'],
      body: [
        D('N', 'int', String(p.ys.length)),
        D('y', 'vec', { vec: p.ys }),
        D('a0', 'num', '0'),
        FOR('i', 0, 'N', [S('a0', 'a0 + 2 * y[i] / N')]),
        P('a0 = ', num('a0', 4), ' (constant term a0/2 = ', num('a0 / 2', 4), ')'),
        FOR('k', 1, String(p.K + 1), [
          D('ak', 'num', '0'), D('bk', 'num', '0'),
          FOR('i', 0, 'N', [D('th', 'num', '2 * pi * i / N'), S('ak', 'ak + 2 * y[i] * cos(k * th) / N'), S('bk', 'bk + 2 * y[i] * sin(k * th) / N')]),
          C('At the Nyquist harmonic (k = N/2) the cosine term is halved and the sine term is 0'),
          IF('N % 2 == 0 and k * 2 == N', [S('ak', 'ak / 2'), S('bk', '0')]),
          P('a', int('k'), ' = ', num('ak', 4), ', b', int('k'), ' = ', num('bk', 4), ', amplitude = ', num('sqrt(ak * ak + bk * bk)', 4)),
        ]),
      ],
    }),
  },

  'truth-table': {
    name: 'Truth tables',
    clean: (raw) => {
      check(truthSolve, raw);
      const f = String(raw.f ?? '');
      const g = String(raw.g ?? '').trim();
      const vars = [...new Set([...lettersIn(f), ...(g ? lettersIn(g) : [])])].sort();
      return { f: toBool(f), g: g ? toBool(g) : null, vars, fText: f.trim(), gText: g };
    },
    program: (p) => {
      const k = p.vars.length;
      return {
        title: 'Truth table',
        about: [`Formula: ${p.fText}${p.gText ? `; compared with: ${p.gText}` : ''}`, '1 = true, 0 = false; rows start with every letter true, as in textbooks'],
        body: [
          D('rows', 'int', String(2 ** k)),
          D('trues', 'int', '0'),
          ...(p.g ? [D('same', 'int', '0')] : []),
          P(`${p.vars.join(' ')} | result${p.g ? ' | second' : ''}`),
          FOR('m', 0, 'rows', [
            ...p.vars.map((v, i) => D(`b${v}`, 'bool', `int(m / ${2 ** (k - 1 - i)}) % 2 == 0`)),
            D('res', 'bool', p.f),
            ...(p.g ? [D('res2', 'bool', p.g)] : []),
            ...p.vars.map((v) => D(`n${v}`, 'int', '0')),
            ...p.vars.map((v) => IF(`b${v}`, [S(`n${v}`, '1')])),
            D('nr', 'int', '0'), IF('res', [S('nr', '1'), S('trues', 'trues + 1')]),
            ...(p.g ? [D('nr2', 'int', '0'), IF('res2', [S('nr2', '1')]), IF('res == res2', [S('same', 'same + 1')])] : []),
            P(...p.vars.flatMap((v) => [int(`n${v}`), ' ']), '| ', int('nr'), ...(p.g ? [' | ', int('nr2')] : [])),
          ]),
          IF('trues == rows', [P('The formula is a tautology.')], [IF('trues == 0', [P('The formula is a contradiction.')], [P('The formula is a contingency.')])]),
          ...(p.g ? [IF('same == rows', [P('The two formulas are logically equivalent.')], [P('The two formulas are not equivalent.')])] : []),
        ],
      };
    },
  },

  'modular-arithmetic': {
    name: 'Modular arithmetic and RSA',
    clean: (raw) => {
      check(modSolve, raw);
      const mode = choice(raw.mode, ['gcd', 'bezout', 'inverse', 'power', 'congruence', 'rsa']);
      const int0 = (v) => Math.round(Number(String(v ?? '').trim()));
      const out = { mode, a: int0(raw.a), b: int0(raw.b), m: int0(raw.m), p: int0(raw.p), q: int0(raw.q), e: int0(raw.e), msg: int0(raw.msg) };
      const big = mode === 'rsa' ? out.p * out.q : Math.max(Math.abs(out.a), Math.abs(out.b), Math.abs(out.m));
      if (big > 90000000) throw new ExportError('Code export uses ordinary numbers, so it takes values up to 90,000,000 (the page handles bigger ones exactly).');
      return out;
    },
    program: (p) => {
      // Floor-based mod on ordinary numbers: always 0 to m - 1, exact while values stay below 2^53
      const mod = (a, m) => `((${a}) - (${m}) * floor((${a}) / (${m})))`;
      const extended = (a, b) => [
        C('Extended Euclid: r = s a + t b at every row'),
        D('r0', 'num', a), D('r1', 'num', b), D('s0', 'num', '1'), D('s1', 'num', '0'), D('t0', 'num', '0'), D('t1', 'num', '1'),
        WHILE('r1 != 0', [
          D('qq', 'num', 'floor(r0 / r1)'),
          D('tr', 'num', 'r0 - qq * r1'), S('r0', 'r1'), S('r1', 'tr'),
          D('ts', 'num', 's0 - qq * s1'), S('s0', 's1'), S('s1', 'ts'),
          D('tt', 'num', 't0 - qq * t1'), S('t0', 't1'), S('t1', 'tt'),
        ]),
      ];
      const power = (base, exp, m, target) => [
        D(target, 'num', '1'), D('pb', 'num', mod(base, m)), D('pe', 'num', exp),
        WHILE('pe > 0', [
          IF(`${mod('pe', '2')} == 1`, [S(target, mod(`${target} * pb`, m))]),
          S('pb', mod('pb * pb', m)),
          S('pe', 'floor(pe / 2)'),
        ]),
      ];
      const body = {
        gcd: [D('x', 'num', lit(Math.abs(p.a))), D('y', 'num', lit(Math.abs(p.b))),
          WHILE('y != 0', [D('r', 'num', mod('x', 'y')), P(num('x', 0), ' = ', num('floor(x / y)', 0), ' * ', num('y', 0), ' + ', num('r', 0)), S('x', 'y'), S('y', 'r')]),
          P('gcd = ', num('x', 0))],
        bezout: [...extended(lit(p.a), lit(p.b)), P('gcd = ', num('r0', 0), ' = (', num('s0', 0), ') * ', num(lit(p.a), 0), ' + (', num('t0', 0), ') * ', num(lit(p.b), 0))],
        inverse: [D('m', 'num', lit(p.m)), ...extended(mod(lit(p.a), 'm'), 'm'),
          IF('r0 != 1', [P('No inverse: gcd = ', num('r0', 0))], [P('Inverse = ', num(mod('s0', 'm'), 0), ' (mod ', num('m', 0), ')')])],
        power: [D('m', 'num', lit(p.m)), ...power(lit(p.a), lit(p.b), 'm', 'res'), P(`${p.a}^${p.b} mod ${p.m} = `, num('res', 0))],
        congruence: [D('m', 'num', lit(p.m)), D('b', 'num', lit(p.b)), ...extended(mod(lit(p.a), 'm'), 'm'),
          IF(`${mod('b', 'r0')} != 0`, [P('No solution: gcd = ', num('r0', 0), ' does not divide ', num('b', 0))], [
            D('m2', 'num', 'm / r0'),
            D('x0', 'num', mod('(b / r0) * s0', 'm2')),
            P('x = ', num('x0', 0), ' (mod ', num('m2', 0), ')'),
            FOR('k', 0, 'int(min(r0, 20))', [P('  solution mod m: ', num('x0 + k * m2', 0))]),
          ])],
        rsa: [
          D('n', 'num', `${lit(p.p)} * ${lit(p.q)}`), D('phi', 'num', `(${lit(p.p)} - 1) * (${lit(p.q)} - 1)`),
          ...extended(mod(lit(p.e), 'phi'), 'phi'),
          D('d', 'num', mod('s0', 'phi')),
          P('n = ', num('n', 0), ', phi = ', num('phi', 0), ', private key d = ', num('d', 0)),
          ...power(lit(p.msg), lit(p.e), 'n', 'c'),
          P('Encrypted: c = m^e mod n = ', num('c', 0)),
          FOR('once', 0, 1, [...power('c', 'd', 'n', 'back'), P('Decrypted: c^d mod n = ', num('back', 0))]),
        ],
      }[p.mode];
      return { title: `Modular arithmetic: ${p.mode === 'rsa' ? 'RSA' : p.mode}`, about: ['Ordinary floating-point numbers, exact for the sizes this export accepts'], body };
    },
  },

  dijkstra: {
    name: "Dijkstra's algorithm",
    clean: (raw) => {
      check(dijkstraSolve, raw);
      const g = graphOf(raw.edges);
      return { ...g, src: g.names.indexOf(String(raw.source ?? '').trim()), directed: raw.directed === 'yes' };
    },
    program: (p) => {
      const n = p.names.length;
      const W = Array.from({ length: n }, () => Array(n).fill(-1));
      p.edges.forEach(([u, v, w]) => {
        if (W[u][v] < 0 || w < W[u][v]) W[u][v] = w;
        if (!p.directed && (W[v][u] < 0 || w < W[v][u])) W[v][u] = w;
      });
      return {
        title: "Dijkstra's shortest paths",
        about: [`Nodes are numbered ${p.names.map((nm, i) => `${i} = ${nm}`).join(', ')}`, 'W[u][v] = -1 means no edge; repeatedly fix the nearest unfixed node and relax its edges'],
        body: [
          D('n', 'int', String(n)),
          D('W', 'mat', { mat: W }),
          D('dist', 'vec', { zeros: 'n' }), D('prev', 'vec', { zeros: 'n' }), D('done', 'vec', { zeros: 'n' }),
          FOR('i', 0, 'n', [S('dist[i]', '1e300'), S('prev[i]', '-1')]),
          S(`dist[${p.src}]`, '0'),
          FOR('step', 0, 'n', [
            D('u', 'int', '0'), D('found', 'bool', 'false'),
            FOR('i', 0, 'n', [IF('done[i] == 0 and (not found or dist[i] < dist[u])', [S('u', 'i'), S('found', 'true')])]),
            IF('not found or dist[u] >= 1e300', [BREAK]),
            S('done[u]', '1'),
            FOR('v', 0, 'n', [IF('W[u, v] >= 0 and done[v] == 0 and dist[u] + W[u, v] < dist[v]', [S('dist[v]', 'dist[u] + W[u, v]'), S('prev[v]', 'float(u)')])]),
          ]),
          ...p.names.flatMap((nm, j) => (j === p.src ? [] : [
            IF(`dist[${j}] >= 1e300`, [P(`${nm}: not reachable`)], [
              P(`${nm}: distance `, num(`dist[${j}]`, 4)),
              ...sayNode(p.names, `prev[${j}]`, '   reached from '),
            ]),
          ])),
        ],
      };
    },
  },

  'bfs-dfs': {
    name: 'BFS and DFS',
    clean: (raw) => {
      check(searchSolve, raw);
      const g = graphOf(raw.edges, false);
      return { ...g, start: g.names.indexOf(String(raw.start ?? '').trim()), dfs: raw.mode === 'dfs', directed: raw.directed === 'yes' };
    },
    program: (p) => {
      const n = p.names.length;
      const A = Array.from({ length: n }, () => Array(n).fill(0));
      p.edges.forEach(([u, v]) => { A[u][v] = 1; if (!p.directed) A[v][u] = 1; });
      return {
        title: p.dfs ? 'Depth-first search' : 'Breadth-first search',
        about: [`Nodes are numbered ${p.names.map((nm, i) => `${i} = ${nm}`).join(', ')}; neighbours are taken in that order`, p.dfs ? 'A stack remembers where to go back to' : 'A queue holds the nodes waiting to be visited'],
        body: [
          D('n', 'int', String(n)),
          D('Adj', 'mat', { mat: A }),
          D('seen', 'vec', { zeros: 'n' }),
          D('order', 'int', '0'),
          ...(p.dfs ? [
            D('stack', 'vec', { zeros: 'n' }), D('next', 'vec', { zeros: 'n' }),
            D('top', 'int', '0'),
            S('stack[0]', String(p.start)), S(`seen[${p.start}]`, '1'),
            S('order', 'order + 1'),
            ...sayNode(p.names, String(p.start), 'Visit '),
            WHILE('top >= 0 and order <= n', [
              D('u', 'int', 'int(stack[top])'),
              D('moved', 'bool', 'false'),
              WHILE('int(next[top]) < n and not moved', [
                D('v', 'int', 'int(next[top])'),
                S('next[top]', 'next[top] + 1'),
                IF('Adj[u, v] == 1 and seen[v] == 0', [
                  S('seen[v]', '1'), S('order', 'order + 1'),
                  ...sayNode(p.names, 'v', 'Visit '),
                  S('top', 'top + 1'), S('stack[top]', 'float(v)'), S('next[top]', '0'),
                  S('moved', 'true'),
                ]),
              ]),
              IF('not moved', [IF('top == 0', [BREAK]), S('top', 'top - 1')]),
            ]),
          ] : [
            D('queue', 'vec', { zeros: 'n' }),
            D('head', 'int', '0'), D('tail', 'int', '1'),
            S('queue[0]', String(p.start)), S(`seen[${p.start}]`, '1'),
            WHILE('head < tail', [
              D('u', 'int', 'int(queue[head])'),
              S('head', 'head + 1'), S('order', 'order + 1'),
              ...sayNode(p.names, 'u', 'Visit '),
              FOR('v', 0, 'n', [IF('Adj[u, v] == 1 and seen[v] == 0', [S('seen[v]', '1'), S('queue[tail]', 'float(v)'), S('tail', 'tail + 1')])]),
            ]),
          ]),
          P('Visited ', int('order'), ' of ', int('n'), ' nodes'),
        ],
      };
    },
  },

  mst: {
    name: 'Minimum spanning tree',
    clean: (raw) => {
      check(mstSolve, raw);
      const g = graphOf(raw.edges);
      const start = g.names.indexOf(String(raw.start ?? '').trim());
      return { ...g, prim: raw.mode === 'prim', start: start >= 0 ? start : 0 };
    },
    program: (p) => {
      const n = p.names.length;
      // Kruskal breaks ties in weight by the first node's name, as the page does: list the edges in that order
      const edges = p.prim ? p.edges : [...p.edges].map((e, i) => [...e, i]).sort((a, b) => a[2] - b[2] || p.rawEdges[a[3]].u.localeCompare(p.rawEdges[b[3]].u)).map((e) => e.slice(0, 3));
      const say = (expr, word) => sayNode(p.names, expr, `${word} `);
      return {
        title: p.prim ? "Prim's minimum spanning tree" : "Kruskal's minimum spanning tree",
        about: [`Nodes are numbered ${p.names.map((nm, i) => `${i} = ${nm}`).join(', ')}`, p.prim ? 'Grow one tree, always adding the cheapest edge that reaches a new node' : 'Take edges from the cheapest up, skipping any that would close a cycle'],
        body: [
          D('n', 'int', String(n)),
          D('m', 'int', String(edges.length)),
          D('E', 'mat', { mat: edges }),
          D('total', 'num', '0'),
          D('taken', 'int', '0'),
          ...(p.prim ? [
            D('inTree', 'vec', { zeros: 'n' }),
            S(`inTree[${p.start}]`, '1'),
            FOR('step', 1, 'n', [
              D('best', 'int', 'm'),
              FOR('e', 0, 'm', [IF('inTree[int(E[e, 0])] != inTree[int(E[e, 1])] and (best == m or E[e, 2] < E[best, 2])', [S('best', 'e')])]),
              IF('best == m', [BREAK]),
              D('a', 'int', 'int(E[best, 0])'), D('b', 'int', 'int(E[best, 1])'),
              S('inTree[a]', '1'), S('inTree[b]', '1'),
              S('total', 'total + E[best, 2]'), S('taken', 'taken + 1'),
              ...say('a', 'Add edge'), ...say('b', '   to'),
              P('   weight ', num('E[best, 2]', 4)),
            ]),
          ] : [
            D('parent', 'vec', { zeros: 'n' }),
            FOR('i', 0, 'n', [S('parent[i]', 'float(i)')]),
            FOR('e', 0, 'm', [
              IF('taken == n - 1', [BREAK]),
              D('ru', 'int', 'int(E[e, 0])'), WHILE('int(parent[ru]) != ru', [S('ru', 'int(parent[ru])')]),
              D('rv', 'int', 'int(E[e, 1])'), WHILE('int(parent[rv]) != rv', [S('rv', 'int(parent[rv])')]),
              D('a', 'int', 'int(E[e, 0])'), D('b', 'int', 'int(E[e, 1])'),
              IF('ru != rv', [
                S('parent[ru]', 'float(rv)'),
                S('total', 'total + E[e, 2]'), S('taken', 'taken + 1'),
                ...say('a', 'Take edge'), ...say('b', '   to'),
                P('   weight ', num('E[e, 2]', 4)),
              ], [...say('a', 'Skip edge (it makes a cycle)'), ...say('b', '   to')]),
            ]),
          ]),
          P('Edges in the tree: ', int('taken'), ', total weight = ', num('total', 4)),
        ],
      };
    },
  },

  simplex: {
    name: 'Simplex method',
    clean: (raw) => {
      check(simplexSolve, raw);
      const lp = lpOf(raw.objective, raw.constraints);
      return { ...lp, dual: raw.mode === 'dual' };
    },
    program: (p) => {
      // Columns: decision variables, then one slack per <=, a surplus and an artificial per >=, an artificial per =
      const colsNames = [...p.vars];
      const cost = p.c.map((x) => (p.sense === 'max' ? x : -x));
      const rowsA = p.rows.map((r) => [...r.a]);
      const basis = [];
      const bigM = 1e6;
      p.rows.forEach((r, i) => {
        const add = (name, coef, cst) => { colsNames.push(name); cost.push(cst); rowsA.forEach((row, k) => row.push(k === i ? coef : 0)); return colsNames.length - 1; };
        if (r.op === '<=') basis.push(add(`s${i + 1}`, 1, 0));
        else {
          if (r.op === '>=') add(`s${i + 1}`, -1, 0);
          basis.push(add(`A${i + 1}`, 1, -bigM));
        }
      });
      const nc = colsNames.length;
      const m = p.rows.length;
      const names = (expr) => colsNames.map((nm, j) => IF(`${expr} == ${j}`, [P(`  ${nm} enters`)]));
      return {
        title: `Simplex method (${p.sense === 'max' ? 'maximise' : 'minimise'} ${p.vars.length} variables)`,
        about: [
          `Columns: ${colsNames.map((nm, j) => `${j} = ${nm}`).join(', ')}`,
          'Big-M method: artificial variables cost -M (M = 1,000,000)', ...(p.sense === 'min' ? ['Minimising z is done as maximising -z'] : []),
          'Enter: the most negative z_j - c_j; leave: the smallest ratio b_i / a_ij over a_ij > 0',
        ],
        body: [
          D('m', 'int', String(m)), D('nc', 'int', String(nc)),
          D('T', 'mat', { mat: rowsA }),
          D('b', 'vec', { vec: p.rows.map((r) => r.b) }),
          D('cost', 'vec', { vec: cost }),
          D('basis', 'vec', { vec: basis }),
          D('zc', 'vec', { zeros: 'nc' }),
          D('ok', 'bool', 'true'),
          FOR('it', 0, 50, [
            FOR('j', 0, 'nc', [S('zc[j]', '-cost[j]'), FOR('i', 0, 'm', [S('zc[j]', 'zc[j] + cost[int(basis[i])] * T[i, j]')])]),
            D('enter', 'int', 'nc'),
            FOR('j', 0, 'nc', [IF('zc[j] < -1e-9 and (enter == nc or zc[j] < zc[enter])', [S('enter', 'j')])]),
            IF('enter == nc', [BREAK]),
            D('leave', 'int', 'm'),
            FOR('i', 0, 'm', [IF('T[i, enter] > 1e-12 and (leave == m or b[i] / T[i, enter] < b[leave] / T[leave, enter])', [S('leave', 'i')])]),
            IF('leave == m', [P('The problem is unbounded.'), S('ok', 'false'), BREAK]),
            P('Iteration ', int('it + 1'), ':'),
            ...names('enter'),
            D('pv', 'num', 'T[leave, enter]'),
            FOR('j', 0, 'nc', [S('T[leave, j]', 'T[leave, j] / pv')]),
            S('b[leave]', 'b[leave] / pv'),
            FOR('i', 0, 'm', [IF('i != leave', [
              D('f', 'num', 'T[i, enter]'),
              FOR('j', 0, 'nc', [S('T[i, j]', 'T[i, j] - f * T[leave, j]')]),
              S('b[i]', 'b[i] - f * b[leave]'),
            ])]),
            S('basis[leave]', 'float(enter)'),
          ]),
          IF('ok', [
            D('z', 'num', '0'),
            ...p.vars.map((v, j) => FOR('once', 0, 1, [
              D('val', 'num', '0'),
              FOR('i', 0, 'm', [IF(`int(basis[i]) == ${j}`, [S('val', 'b[i]')])]),
              S('z', `z + ${lit(p.c[j])} * val`),
              P(`${v} = `, num('val', 4)),
            ])),
            P(`${p.sense === 'max' ? 'Maximum' : 'Minimum'} z = `, num('z', 4)),
            ...(p.dual ? [C('Dual values (shadow prices): z_j - c_j under each slack column'),
              ...p.rows.map((r, i) => (colsNames.includes(`s${i + 1}`) ? P(`y${i + 1} = `, num(`${r.op === '>=' ? '-' : ''}zc[${colsNames.indexOf(`s${i + 1}`)}]`, 4)) : C(`Constraint ${i + 1} has no slack column`)))] : []),
          ]),
        ],
      };
    },
  },
};
