/**
 * Code export (src/app/utils/codeExport): every method in all six languages is generated; the Python,
 * JavaScript, C++ and Go programs are run (when those tools are installed) and must print the same answer,
 * which must match the NETZ solver engine where one is given. Rust and MATLAB are only generated.
 *
 *   node test_code_export.mjs          all methods
 *   node test_code_export.mjs bisection   one method
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';

const { generateCode, LANG_ORDER, EXPORTABLE, fromRegistry, ExportError } = await import('./src/app/utils/codeExport/index.js');

const A3 = [['4', '1', '1', '5'], ['1', '4', '1', '6'], ['1', '1', '4', '7']];
// Inputs as the solver pages send them (their default examples), and the answer the page shows
const CASES = {
  bisection: [{ f: 'x * x * x - 4 * x - 9', tol: 0.05 }, 2.71875],
  'false-position': [{ f: 'x^3 - 4*x - 9', tol: 0.0001 }, 2.706528],
  'newton-raphson': [{ f: 'x * x * x - 4 * x - 9', x0: '2.5', tol: 0.0001 }, 2.706528],
  secant: [{ f: 'x^3 - 2*x - 5', x0: '2', x1: '3', tol: 0.0001, maxIter: 50 }, 2.094551],
  'fixed-point': [{ g: '(x + 1)^(1/3)', x0: '1.5', tol: 0.0001, maxIter: 50 }, 1.324719],
  'gauss-seidel': [{ A: [['4', '-1', '1', '8'], ['-1', '3', '2', '20'], ['1', '-1', '3', '8']], tol: 0.0001, maxIter: 50 }, null],
  jacobi: [{ A: A3, tol: 0.0001, maxIter: 50 }, null],
  'newton-forward': [{ x: '10, 20, 30, 40', y: '46, 66, 81, 93', at: '15' }, 56.75],
  'newton-backward': [{ x: '10, 20, 30, 40', y: '46, 66, 81, 93', at: '38' }, null],
  'gauss-forward': [{ x: '20, 25, 30, 35, 40', y: '12, 15, 20, 27, 39', at: '32' }, null],
  'gauss-backward': [{ x: '20, 25, 30, 35, 40', y: '12, 15, 20, 27, 39', at: '28' }, null],
  lagrange: [{ x: '5, 6, 9, 11', y: '12, 13, 14, 16', at: '10' }, 14.666667],
  'newton-divided': [{ x: '5, 7, 11, 13', y: '150, 392, 1452, 2366', at: '9' }, 810],
  trapezoidal: [{ f: '1 / (1 + x^2)', a: 0, b: 1, n: 6 }, 0.784241],
  'simpson-13': [{ f: '1 / (1 + x)', a: 0, b: 1, n: 6 }, 0.693152],
  'simpson-38': [{ f: '1 / (1 + x^2)', a: 0, b: 1, n: 6 }, 0.785398],
  boole: [{ f: '1 / (1 + x)', a: 0, b: 4, n: 4 }, 1.617778],
  weddle: [{ f: '1 / (1 + x^2)', a: 0, b: 6, n: 6 }, 1.373448],
  'gauss-quadrature': [{ f: 'x^2 + 1', a: '0', b: '1', points: 3 }, 1.333333],
  'numerical-differentiation': [{ f: 'x^3 - 2*x + 5', x0: 2, h: 0.01 }, 12.0],
  'gauss-elimination': [{ A: A3 }, null],
  'gauss-jordan': [{ A: A3 }, null],
  lu: [{ A: [['2', '3', '1', '9'], ['1', '2', '3', '6'], ['3', '1', '2', '8']] }, null],
  euler: [{ f: 'x + y', x0: 0, y0: 1, h: 0.1, xn: 0.5 }, 1.72102],
  'modified-euler': [{ f: 'x + y', x0: 0, y0: 1, h: 0.1, xn: 0.3 }, null],
  'runge-kutta': [{ f: 'x + y', x0: 0, y0: 1, h: 0.1, xn: 0.2 }, 1.242805],
  taylor: [{ f: 'x + y', x0: 0, y0: 1, xn: 0.2 }, 1.242667],
  'straight-line': [{ x: '0, 1, 2, 3, 4', y: '1, 1.8, 3.3, 4.5, 6.3' }, null],
  parabola: [{ x: '-2, -1, 0, 1, 2', y: '15, 7, 3, 3, 7' }, null],
  'least-squares': [{ x: '1, 2, 3, 4, 5', y: '2.5, 4.2, 7.5, 12.8, 22.1', model: 'exponential' }, null],
  'z-test': [{ mean: 105, mu: 100, sigma: 15, n: 50 }, 2.357023],
  't-test': [{ data: '12, 15, 14, 11, 13, 16, 15, 14', mu: 13 }, null],
  'chi-square': [{ observed: '20, 30, 25, 25', expected: '25, 25, 25, 25' }, 2],
  'f-test': [{ s1: '20, 22, 19, 23, 21, 24', s2: '18, 17, 21, 19, 16' }, null],
};

let failed = 0;
let checks = 0;
const expect = (name, ok, detail = '') => {
  checks++;
  if (!ok) {
    failed++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

// g++ from MSYS2 needs its own folder on PATH to find its DLLs when Node starts it
const gxx = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['g++'], { encoding: 'utf8' }).stdout?.split(/\r?\n/)[0]?.trim();
const ENV = gxx ? { ...process.env, PATH: `${dirname(gxx)}${delimiter}${process.env.PATH}` } : process.env;
const has = (cmd, args = ['--version']) => spawnSync(cmd, args, { stdio: 'ignore', shell: process.platform === 'win32' }).status === 0;
const TOOLS = { python: has('python'), cpp: has('g++'), go: has('go', ['version']) };
const dir = mkdtempSync(join(tmpdir(), 'netz-code-'));

const lastNumbers = (out) => (out.trim().split(/\r?\n/).pop().match(/-?\d+\.\d+|-?\d+/g) || []).map(Number);

function run(lang, code, file) {
  const path = join(dir, file);
  writeFileSync(path, code);
  const opts = { encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'], env: ENV };
  if (lang === 'python') return execFileSync('python', [path], opts);
  if (lang === 'javascript') return execFileSync(process.execPath, [path], opts);
  if (lang === 'cpp') {
    const exe = path.replace(/\.cpp$/, process.platform === 'win32' ? '.exe' : '');
    execFileSync('g++', ['-std=c++17', '-O1', '-Wall', '-Werror', '-Wno-unused-variable', path, '-o', exe], opts);
    return execFileSync(exe, [], opts);
  }
  if (lang === 'go') return execFileSync('go', ['run', path], { ...opts, env: { ...process.env, GOFLAGS: '' } });
  return null;
}

const only = process.argv[2];
expect('every case is exportable', Object.keys(CASES).every((m) => EXPORTABLE.has(m)) && EXPORTABLE.size === Object.keys(CASES).length, [...EXPORTABLE].filter((m) => !CASES[m]).join(','));

for (const [method, [raw, answer]] of Object.entries(CASES)) {
  if (only && method !== only) continue;
  const outputs = {};
  for (const lang of LANG_ORDER) {
    let code;
    try {
      code = generateCode(method, raw, lang);
    } catch (err) {
      expect(`${method} ${lang} generates`, false, err.message);
      continue;
    }
    expect(`${method} ${lang} has a file name`, code.filename.startsWith('netz_'));
    expect(`${method} ${lang} names NETZ`, code.code.includes('Made with NETZ'));
    if (lang === 'rust') expect(`${method} rust has fn main`, code.code.includes('fn main()'));
    if (lang === 'matlab') {
      const codeLines = code.code.split('\n').filter((l) => !l.trim().startsWith('%') && !l.includes('fprintf'));
      expect(`${method} matlab has no 0-based index`, !codeLines.some((l) => /\w\(0\)/.test(l)));
    }
    if (lang === 'javascript' || TOOLS[lang]) {
      try {
        outputs[lang] = run(lang, code.code, code.filename);
      } catch (err) {
        expect(`${method} ${lang} runs`, false, String(err.stderr || err.message).slice(0, 600));
      }
    }
  }
  const ran = Object.entries(outputs);
  if (!ran.length) continue;
  const ref = lastNumbers(ran[0][1]);
  ran.forEach(([lang, out]) => {
    const got = lastNumbers(out);
    expect(`${method}: ${lang} prints the same answer as ${ran[0][0]}`, got.length === ref.length && got.every((v, i) => Math.abs(v - ref[i]) < 1e-5), `${ran[0][0]}: ${ref} vs ${lang}: ${got}`);
  });
  if (answer !== null) {
    const all = (ran[0][1].match(/-?\d+\.\d+|-?\d+/g) || []).map(Number);
    expect(`${method}: answer ${answer}`, all.some((v) => Math.abs(v - answer) < 1e-3), ran[0][1].trim().split('\n').slice(-3).join(' | '));
  }
}

// Inputs a student can get wrong come back as a message, never a crash
const bad = (method, raw) => {
  try {
    generateCode(method, raw, 'python');
    return false;
  } catch (err) {
    return err instanceof ExportError && err.message.length > 0;
  }
};
expect('empty function is a message', bad('bisection', { f: '' }));
expect('unknown name is a message', bad('bisection', { f: 'x + q' }));
expect('Simpson 3/8 strips must be a multiple of 3', bad('simpson-38', { f: 'x', a: 0, b: 1, n: 4 }));
expect('x and y lengths must match', bad('lagrange', { x: '1, 2, 3', y: '1, 2', at: 2 }));
expect('missing matrix entry is a message', bad('gauss-elimination', { A: [['1', '', '3'], ['1', '2', '3']] }));

// Functions with maths library calls in every language
for (const lang of LANG_ORDER) {
  const { code } = generateCode('trapezoidal', { f: 'sin(x) + e^x + ln(x + 1) + sqrt(x) + abs(x - 2) + pi', a: 0, b: 1, n: 4 }, lang);
  expect(`${lang}: maths functions written`, /sin/i.test(code) && /exp/i.test(code));
  if (lang === 'javascript' || TOOLS[lang]) {
    try {
      const out = run(lang, code, `fns_${lang}.${{ python: 'py', javascript: 'js', cpp: 'cpp', go: 'go' }[lang]}`);
      expect(`${lang}: maths functions run`, Math.abs(lastNumbers(out)[0] - 7.853) < 0.01, out.trim().split('\n').pop());
    } catch (err) {
      expect(`${lang}: maths functions run`, false, String(err.stderr || err.message).slice(0, 400));
    }
  }
}

// Notes solver widgets map onto the same programs
const reg = fromRegistry('rk4', { expression: 'x + y', x0: 0, y0: 1, h: 0.1, targetX: 0.2 });
expect('registry rk4 → runge-kutta', reg?.method === 'runge-kutta' && generateCode(reg.method, reg.raw, 'python').code.includes('k4'));
expect('registry t-test has no export (summary only)', fromRegistry('t-test', {}) === null);

rmSync(dir, { recursive: true, force: true });
console.log(`Tools: python ${TOOLS.python ? 'yes' : 'no'}, g++ ${TOOLS.cpp ? 'yes' : 'no'}, go ${TOOLS.go ? 'yes' : 'no'}, node yes; Rust and MATLAB are generated only`);
console.log(`${checks - failed}/${checks} checks passed`);
if (failed) process.exit(1);
