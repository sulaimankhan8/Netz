import { register } from 'node:module';

// The Playground utils use extensionless relative imports (resolved by the Next.js bundler).
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

const { clusterStrokes } = await import('./src/app/(Primary.pages)/Playground/utils/spatialClusterer.js');

/**
 * An "=" written a little apart from its expression must still belong to it,
 * otherwise there is nothing to evaluate. Also: highlighter marks are not writing.
 */

let t = 0;
let n = 0;
function stroke(minX, minY, maxX, maxY, tool = 'pen') {
  n++;
  t += 300;
  return {
    id: `s${n}`,
    tool,
    bbox: { minX, minY, maxX, maxY },
    points: [
      { x: minX, y: minY, timestamp: t },
      { x: maxX, y: maxY, timestamp: t + 100 },
    ],
  };
}

// "1 + 1" written `height` px tall starting at x0, then "=" after `gap` px
function expressionWithEquals(height, gap, { equalsDy = 0, x0 = 300, y0 = 300 } = {}) {
  const h = height;
  const strokes = [
    stroke(x0, y0, x0, y0 + h), // 1
    stroke(x0 + h * 0.6, y0 + h * 0.5, x0 + h * 1.3, y0 + h * 0.5), // + bar
    stroke(x0 + h * 0.95, y0 + h * 0.15, x0 + h * 0.95, y0 + h * 0.85), // + stem
    stroke(x0 + h * 2, y0, x0 + h * 2, y0 + h), // 1
  ];
  const eqX = x0 + h * 2 + gap;
  const eqY = y0 + h * 0.4 + equalsDy;
  strokes.push(stroke(eqX, eqY, eqX + h * 0.6, eqY), stroke(eqX, eqY + h * 0.25, eqX + h * 0.6, eqY + h * 0.25));
  return strokes;
}

let failed = 0;
let checks = 0;
function expect(name, condition, detail = '') {
  checks++;
  if (!condition) {
    failed++;
    console.error(`FAIL  ${name} ${detail}`);
  }
}

// The case found in the browser: 60 px writing, "=" 50 px away (fixed margins top out at 48 px)
let clusters = clusterStrokes(expressionWithEquals(60, 50), 32);
expect('60 px writing, "=" 50 px away: one cluster', clusters.length === 1, `(got ${clusters.length})`);
expect('60 px writing, "=" 50 px away: flagged as ending in "="', clusters[0] && clusters[0].hasEqualsGesture === true);
expect('60 px writing, "=" 50 px away: all six strokes kept', clusters[0] && clusters[0].strokes.length === 6);

// Large iPad-style writing
clusters = clusterStrokes(expressionWithEquals(120, 110), 32);
expect('120 px writing, "=" 110 px away: one cluster', clusters.length === 1, `(got ${clusters.length})`);

// Close "=" was already one cluster and must stay so
clusters = clusterStrokes(expressionWithEquals(40, 20), 32);
expect('40 px writing, "=" 20 px away: one cluster', clusters.length === 1, `(got ${clusters.length})`);
expect('40 px writing, "=" 20 px away: flagged as ending in "="', clusters[0] && clusters[0].hasEqualsGesture === true);

// Too far away to belong to the expression: more than 1.5 times the writing's height
clusters = clusterStrokes(expressionWithEquals(60, 200), 32);
expect('"=" 200 px from 60 px writing: stays separate', clusters.length === 2, `(got ${clusters.length})`);

// On a different line
clusters = clusterStrokes(expressionWithEquals(60, 60, { equalsDy: 200 }), 32);
expect('"=" two lines below: stays separate', clusters.length === 2, `(got ${clusters.length})`);

// "=" to the LEFT of an expression is not its result sign
const left = expressionWithEquals(60, 50);
const eqStrokes = left.slice(4).map((s) => {
  const dx = -(s.bbox.minX - 150);
  return { ...s, bbox: { ...s.bbox, minX: s.bbox.minX + dx, maxX: s.bbox.maxX + dx }, points: s.points.map((p) => ({ ...p, x: p.x + dx })) };
});
clusters = clusterStrokes([...left.slice(0, 4), ...eqStrokes], 32);
expect('"=" left of the expression: stays separate', clusters.length === 2, `(got ${clusters.length})`);

// Stable IDs: adding the "=" must not change the expression cluster's ID
const base = expressionWithEquals(60, 50);
const idBefore = clusterStrokes(base.slice(0, 4), 32)[0].clusterId;
const idAfter = clusterStrokes(base, 32)[0].clusterId;
expect('cluster ID unchanged after "=" is added', idBefore === idAfter, `(${idBefore} -> ${idAfter})`);

// Highlighter strokes are never part of a recognition cluster
const withHighlight = [...expressionWithEquals(60, 50), stroke(290, 320, 480, 340, 'highlighter')];
clusters = clusterStrokes(withHighlight, 32);
expect('highlighter stroke left out of clusters', clusters.every((c) => c.strokes.every((s) => s.tool !== 'highlighter')));
expect('highlighter stroke does not change the cluster', clusters.length === 1 && clusters[0].strokes.length === 6);
expect('only highlighter on the page: no clusters', clusterStrokes([stroke(10, 10, 200, 30, 'highlighter')], 32).length === 0);

if (failed > 0) {
  console.error(`\n ${failed}/${checks} clustering checks FAILED`);
  process.exit(1);
}
console.log(`\n SUCCESS: All ${checks}/${checks} clustering checks passed!`);
