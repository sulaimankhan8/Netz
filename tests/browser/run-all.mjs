// Runs every pass/fail browser suite against a running app and prints one line per suite.
//   1. In the project root:  npx next dev -p 3210     (or: npm run build && npx next start -p 3210)
//   2. In this folder:       npm install   (once)   then   node run-all.mjs
// Another address: NETZ_URL=http://localhost:3000 node run-all.mjs
// Another Chrome:  CHROME_PATH="/path/to/chrome" node run-all.mjs
import { spawnSync } from 'node:child_process';

const SUITES = [
  'undo', 'touch', 'eraser', 'lasso', 'export', 'pen', 'blocks', 'workspace', 'render',
  // Insert group (PLAYGROUND_INSERT_TOOLS_PLAN.md)
  'insert-shapes', 'insert-shapes-format', 'insert-shapes-arrange', 'insert-symbols', 'insert-equations', 'insert-screenshot',
  // UX fixes (PLAYGROUND_UX_FIX_PLAN.md)
  'ux-fixes',
];
const only = process.argv.slice(2);
let failedSuites = 0;

for (const suite of SUITES) {
  if (only.length && !only.includes(suite)) continue;
  const run = spawnSync(process.execPath, [`${suite}.mjs`], { encoding: 'utf8', cwd: import.meta.dirname, timeout: 600000 });
  const output = `${run.stdout || ''}${run.stderr || ''}`;
  const summary = output.split('\n').find((line) => /checks passed/.test(line)) || '(no summary line: the suite did not finish)';
  const failures = output.split('\n').filter((line) => line.startsWith('FAIL'));
  const match = summary.match(/(\d+)\/(\d+)/);
  const ok = match && match[1] === match[2] && failures.length === 0;
  if (!ok) failedSuites++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${suite.padEnd(20)} ${summary.trim()}`);
  for (const line of failures) console.log(`        ${line}`);
}

console.log(failedSuites === 0 ? '\nAll suites passed.' : `\n${failedSuites} suite(s) failed.`);
process.exit(failedSuites === 0 ? 0 : 1);
