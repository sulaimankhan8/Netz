/**
 * Graph algorithms for Unit 15: Dijkstra, BFS/DFS, minimum spanning trees (Prim and Kruskal).
 * Graphs are typed as an edge list: "A B 4; A C 2; B C 1" (a weight is optional for BFS/DFS). Node names are
 * letters, words or numbers. Each function returns a step table, the result and the edges to highlight in GraphView.
 */
import { EngineError } from '../numeric/steps';

/** "A B 4; A-C 2, B C" → { nodes, edges: [{ u, v, w }] }. */
export function readGraph(text, { weighted = true } = {}) {
  const parts = String(text ?? '').split(/[;\n]/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) throw new EngineError('Type the edges, e.g. A B 4; A C 2; B C 1.');
  const edges = parts.map((p) => {
    const t = p.replace(/[-–>→,]/g, ' ').split(/\s+/).filter(Boolean);
    if (t.length < 2 || t.length > 3) throw new EngineError(`Write each edge as "A B 4" (could not read "${p}").`);
    const w = t.length === 3 ? Number(t[2]) : 1;
    if (weighted && t.length === 3 && !Number.isFinite(w)) throw new EngineError(`The weight in "${p}" is not a number.`);
    if (w < 0) throw new EngineError('Weights must not be negative here (Dijkstra needs that).');
    return { u: t[0], v: t[1], w };
  });
  const nodes = [...new Set(edges.flatMap((e) => [e.u, e.v]))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (nodes.length > 26) throw new EngineError('Use at most 26 nodes.');
  return { nodes, edges };
}
const adjacency = (g, directed) => {
  const adj = Object.fromEntries(g.nodes.map((n) => [n, []]));
  g.edges.forEach(({ u, v, w }) => { adj[u].push({ to: v, w }); if (!directed) adj[v].push({ to: u, w }); });
  Object.values(adj).forEach((l) => l.sort((a, b) => a.to.localeCompare(b.to, undefined, { numeric: true })));
  return adj;
};
const show = (d) => (d === Infinity ? '∞' : String(Number(d.toPrecision(10))));

export function dijkstra({ edges, source, directed = 'no', target = '' }) {
  const g = readGraph(edges);
  const dir = directed === 'yes';
  if (!g.nodes.includes(source)) throw new EngineError(`The source "${source}" is not in the graph (nodes: ${g.nodes.join(', ')}).`);
  const adj = adjacency(g, dir);
  const dist = Object.fromEntries(g.nodes.map((n) => [n, Infinity])), prev = {};
  dist[source] = 0;
  const done = new Set();
  const rows = [];
  while (done.size < g.nodes.length) {
    const u = g.nodes.filter((n) => !done.has(n)).reduce((a, b) => (dist[b] < dist[a] ? b : a));
    if (dist[u] === Infinity) break;
    done.add(u);
    for (const { to, w } of adj[u]) if (!done.has(to) && dist[u] + w < dist[to]) { dist[to] = dist[u] + w; prev[to] = u; }
    rows.push({ step: rows.length + 1, visit: u, ...Object.fromEntries(g.nodes.map((n) => [n, done.has(n) && n !== u ? '✓' : `${show(dist[n])}${prev[n] ? ` (${prev[n]})` : ''}`])) });
  }
  const pathTo = (t) => { const p = [t]; while (prev[p[0]]) p.unshift(prev[p[0]]); return p[0] === source ? p : null; };
  const paths = g.nodes.filter((n) => n !== source).map((n) => ({ to: n, d: show(dist[n]), path: dist[n] === Infinity ? '—' : pathTo(n).join(' → ') }));
  const tree = Object.entries(prev).map(([v, u]) => ({ u, v }));
  const highlight = target && prev[target] ? pathTo(target).slice(1).map((v, i) => ({ u: pathTo(target)[i], v })) : tree;
  return {
    graph: g, directed: dir, highlight, paths, rows,
    columns: [{ key: 'step', label: 'Step', bold: true }, { key: 'visit', label: 'Visit', highlight: true }, ...g.nodes.map((n) => ({ key: n, label: n }))],
    steps: [{ title: "Dijkstra's algorithm", formula: 'd(v) \\leftarrow \\min(d(v),\\ d(u) + w(u, v))', depth: 0, lines: ['\\text{Each step visits the unvisited node with the smallest distance and updates its neighbours.}'] }],
    notes: ['Distances in brackets show the node they came from; ✓ marks a node already fixed.'], verified: true,
  };
}

export function bfsDfs({ edges, start, mode = 'bfs', directed = 'no' }) {
  const g = readGraph(edges, { weighted: false });
  if (!g.nodes.includes(start)) throw new EngineError(`The start "${start}" is not in the graph (nodes: ${g.nodes.join(', ')}).`);
  const adj = adjacency(g, directed === 'yes');
  const order = [], rows = [], treeEdges = [];
  const seen = new Set([start]);
  if (mode === 'bfs') {
    const queue = [start];
    while (queue.length) {
      const u = queue.shift();
      order.push(u);
      const added = [];
      for (const { to } of adj[u]) if (!seen.has(to)) { seen.add(to); queue.push(to); added.push(to); treeEdges.push({ u, v: to }); }
      rows.push({ step: order.length, visit: u, added: added.join(', ') || '—', state: queue.join(', ') || '—' });
    }
  } else {
    // Recursive DFS (neighbours in alphabetical order); the path of open calls is the stack
    const path = [];
    const visit = (u, from) => {
      seen.add(u);
      order.push(u);
      path.push(u);
      if (from) treeEdges.push({ u: from, v: u });
      const next = adj[u].map((x) => x.to).filter((x) => !seen.has(x));
      rows.push({ step: order.length, visit: u, added: next.join(', ') || '— (back up)', state: [...path].reverse().join(', ') });
      for (const { to } of adj[u]) if (!seen.has(to)) visit(to, u);
      path.pop();
    };
    visit(start, null);
  }
  const missed = g.nodes.filter((n) => !order.includes(n));
  return {
    graph: g, directed: directed === 'yes', order, highlight: treeEdges, rows,
    columns: [{ key: 'step', label: 'Step', bold: true }, { key: 'visit', label: 'Visit', highlight: true }, { key: 'added', label: mode === 'bfs' ? 'Added to queue' : 'Still to explore' }, { key: 'state', label: mode === 'bfs' ? 'Queue (front first)' : 'Stack of open calls (top first)' }],
    steps: [{ title: mode === 'bfs' ? 'Breadth-first search (a queue)' : 'Depth-first search (a stack)', depth: 0, lines: [`\\text{Order: } ${order.join(' \\to ')}`] }],
    notes: [mode === 'bfs' ? 'BFS visits nodes in order of distance (number of edges) from the start.' : 'DFS goes as deep as it can before backing up. Neighbours are taken in alphabetical order.', ...(missed.length ? [`Not reachable from ${start}: ${missed.join(', ')}.`] : [])], verified: true,
  };
}

export function mst({ edges, mode = 'kruskal', start = '' }) {
  const g = readGraph(edges);
  const rows = [], chosen = [];
  let total = 0;
  if (mode === 'kruskal') {
    const parent = Object.fromEntries(g.nodes.map((n) => [n, n]));
    const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const sorted = [...g.edges].sort((a, b) => a.w - b.w || a.u.localeCompare(b.u));
    for (const e of sorted) {
      const ru = find(e.u), rv = find(e.v);
      const ok = ru !== rv;
      if (ok) { parent[ru] = rv; chosen.push(e); total += e.w; }
      rows.push({ edge: `${e.u}–${e.v}`, w: e.w, action: ok ? 'take' : 'skip (makes a cycle)' });
      if (chosen.length === g.nodes.length - 1) break;
    }
  } else {
    const s = start && g.nodes.includes(start) ? start : g.nodes[0];
    const inTree = new Set([s]);
    while (inTree.size < g.nodes.length) {
      const cand = g.edges.filter((e) => inTree.has(e.u) !== inTree.has(e.v));
      if (!cand.length) break;
      const e = cand.reduce((a, b) => (b.w < a.w ? b : a));
      const nw = inTree.has(e.u) ? e.v : e.u;
      inTree.add(nw); chosen.push(e); total += e.w;
      rows.push({ edge: `${e.u}–${e.v}`, w: e.w, action: `add ${nw}; tree = {${[...inTree].join(', ')}}` });
    }
  }
  if (chosen.length !== g.nodes.length - 1) throw new EngineError('The graph is not connected, so it has no spanning tree.');
  return {
    graph: g, directed: false, highlight: chosen.map(({ u, v }) => ({ u, v })), total, rows,
    columns: [{ key: 'edge', label: 'Edge', bold: true }, { key: 'w', label: 'Weight' }, { key: 'action', label: mode === 'kruskal' ? 'Take or skip' : 'Grow the tree', highlight: true }],
    steps: [{ title: mode === 'kruskal' ? "Kruskal's algorithm" : "Prim's algorithm", formula: mode === 'kruskal' ? '\\text{cheapest edge that makes no cycle}' : '\\text{cheapest edge leaving the tree}', depth: 0, lines: [`\\text{Total weight } = ${chosen.map((e) => e.w).join(' + ')} = ${Number(total.toPrecision(10))}`] }],
    notes: ['A spanning tree of n nodes has n − 1 edges. Prim and Kruskal give the same total (the tree itself can differ when weights tie).'], verified: true,
  };
}
