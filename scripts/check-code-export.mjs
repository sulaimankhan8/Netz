// Compiles and runs the exported Python, C++ and Go programs for every code-export case and checks each one
// prints the NETZ engine's answer (JavaScript runs in npm run test:engines). Needs python, g++ and go on PATH.
// Run: npm run check:code-export            (ONLY=sor,romberg to run a few; LANGS=python,go to pick languages)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { generateCode } from '../src/app/utils/codeExport/index.js';
import { CASES, inputsOf, matches } from '../tests/engines/code-export-cases.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
const LANGS = (process.env.LANGS || 'python,cpp,go').split(',');
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'netz-code-'));
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', timeout: 120000, ...opts });

const RUNNERS = {
  python: (file) => run('python', [file]),
  cpp: (file) => {
    const exe = file.replace(/\.cpp$/, '.exe');
    const c = run('g++', ['-O1', '-std=c++17', '-o', exe, file]);
    return c.status ? c : run(exe, []);
  },
  go: (file) => {
    const exe = file.replace(/\.go$/, '.exe');
    const c = run('go', ['build', '-o', exe, file], { cwd: path.dirname(file), env: { ...process.env, GO111MODULE: 'off' } });
    return c.status ? c : run(exe, []);
  },
};

let bad = 0;
let done = 0;
for (const [k, c] of CASES.entries()) {
  if (ONLY && !ONLY.has(c.id)) continue;
  const raw = inputsOf(c);
  const solve = (await import(pathToFileURL(path.join(ROOT, 'src/app/utils/engines', `${c.id}.js`)).href)).solve;
  const out = solve(raw);
  for (const lang of LANGS) {
    const { code, filename } = generateCode(c.id, raw, lang);
    const sub = path.join(DIR, `${k}-${lang}`);
    fs.mkdirSync(sub, { recursive: true });
    const file = path.join(sub, filename);
    fs.writeFileSync(file, code);
    const r = RUNNERS[lang](file);
    const text = `${r.stdout || ''}`;
    const { missing, unsaid } = r.status === 0 ? matches(text, c.pick ? c.pick(out) : [], c.say ? c.say(out) : [], c.tol) : { missing: ['(did not run)'], unsaid: [] };
    done++;
    if (missing.length || unsaid.length) {
      bad++;
      console.log(`FAIL ${c.id} #${k} ${lang}: ${missing.length ? `missing ${missing.join(', ')}` : ''} ${unsaid.join(' | ')}`);
      console.log(`  ${(r.stderr || '').split('\n').slice(0, 6).join('\n  ')}`);
      console.log(`  file: ${file}`);
    }
  }
}
console.log(`${done - bad} of ${done} programs printed the engine's answer (${LANGS.join(', ')}).`);
process.exit(bad ? 1 : 0);
