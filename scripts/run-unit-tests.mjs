/**
 * Runs every logic test in tests/unit, one Node process each, and lists which passed.
 *
 *   npm run test:unit              # all of them
 *   npm run test:unit -- shape     # only files whose name contains "shape"
 *
 * Each test runs with the same loader as the engine tests (tests/engines/register.mjs), so app code that
 * uses `@/` paths and imports without a file ending loads the way the Next.js bundler loads it.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('tests/unit');
const filter = process.argv[2] || '';
const files = fs.readdirSync(dir).filter((f) => /^test_.*\.mjs$/.test(f) && f.includes(filter)).sort();

const failed = [];
for (const file of files) {
  const started = Date.now();
  const run = spawnSync(
    process.execPath,
    ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', '--import', './tests/engines/register.mjs', path.join('tests/unit', file)],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  );
  const ok = run.status === 0;
  const lastLine = `${run.stdout || ''}`.trim().split('\n').filter(Boolean).pop() || '';
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`${ok ? 'pass' : 'FAIL'}  ${file.padEnd(32)} ${seconds.padStart(5)} s  ${ok ? lastLine.trim().slice(0, 80) : ''}`);
  if (!ok) {
    failed.push(file);
    process.stdout.write(`${run.stdout || ''}${run.stderr || ''}`.split('\n').slice(-15).join('\n') + '\n');
  }
}

console.log(`\n${files.length - failed.length}/${files.length} test files passed`);
if (failed.length) process.exitCode = 1;
