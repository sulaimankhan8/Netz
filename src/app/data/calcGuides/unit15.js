// Guide mode words for the Unit 15 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const EDGES = 'One edge per item, separated by `;`: two node names and, for weighted graphs, the weight: `A B 4; A C 2`.';
const DIRECTED = 'Undirected: a road both ways. Directed: one way only (A → B).';

const GUIDES = {
  'truth-table': {
    howTo: ['Type the formula with p, q, r …: `(p → q) ∧ ¬q → ¬p`. You can type `->`, `&`, `|`, `~` instead of the symbols.', 'Optionally type a second formula to check whether they are equivalent.', 'Press {button}.'],
    help: { f: 'The logic formula.', g: 'Optional: a second formula to compare.' },
  },
  'modular-arithmetic': {
    howTo: ['Choose what to find: a mod m, an inverse, a power, the GCD, or RSA.', 'Fill the boxes that appear with whole numbers.', 'Press {button}.'],
    help: { mode: 'Which calculation.', a: 'A whole number.', b: 'A second number, or the exponent.', m: 'The modulus.', p: 'A prime p.', q: 'A second prime q.', e: 'The public exponent e.', msg: 'The message, as a number smaller than n = pq.' },
  },
  'recurrence-relations': {
    howTo: ['Type the recurrence using a(n): `a(n) = 5a(n-1) - 6a(n-2) + 2^n`.', 'Type the starting values: `a(0) = 1, a(1) = 0`.', 'Press {button} for the characteristic equation and the closed form.'],
    help: { eq: 'Use a(n), a(n-1), a(n-2).', ics: 'The first values.' },
  },
  dijkstra: {
    howTo: ['Type the edges with weights: `A B 4; A C 2`.', 'Type the starting node (and optionally the end node).', 'Choose directed or undirected and press {button} for the table of shortest distances.'],
    help: { edges: EDGES, source: 'The node to start from.', target: 'Optional: the node to reach.', directed: DIRECTED },
  },
  'bfs-dfs': {
    howTo: ['Choose breadth-first or depth-first search.', 'Type the edges: `A B; A C; B D`, and the start node.', 'Press {button} to see the order nodes are visited.'],
    help: { mode: 'BFS goes level by level; DFS goes as deep as it can first.', edges: EDGES, start: 'The node to start from.', directed: DIRECTED },
  },
  mst: {
    howTo: ["Choose Kruskal's or Prim's algorithm.", 'Type the edges with weights: `A B 4; A C 2`.', 'Press {button} for the minimum spanning tree and its total weight.'],
    help: { mode: "Kruskal adds the cheapest edges; Prim grows from one node.", edges: EDGES, start: "Where Prim's algorithm starts." },
  },
  'k-map-simplifier': {
    howTo: ['Choose how you give the function: minterms or an expression.', 'Choose the number of variables and type the minterms (`0, 2, 5, 7`) or the expression (`AB + A\'C`).', "Optionally type don't-cares, then press {button}."],
    help: { mode: 'Minterm numbers, or a Boolean expression.', vars: 'How many variables: 2, 3 or 4.', m: 'The minterm numbers, separated by commas.', expr: "' means NOT, + means OR: `AB + A'C`.", d: "Optional: don't-care minterms." },
  },
  simplex: {
    howTo: ['Type the objective with max or min: `max 3x + 5y`.', 'Type the constraints separated by `;`: `x + 2y <= 8; 3x + 2y <= 12`.', 'Press {button} for each simplex table.'],
    help: { mode: 'Simplex tables, or the dual.', objective: 'Start with max or min.', constraints: 'Use <=, >= or =. x, y ≥ 0 is assumed.' },
  },
  'transportation-problem': {
    howTo: ['Type the cost table: one row per source, `;` between rows.', 'Type the supply of each source and the demand of each destination.', 'Choose the starting method and press {button}.'],
    help: {
      costs: 'Rows separated by `;`, numbers by spaces.', supply: 'One number per row of the table.', demand: 'One number per column.',
      method: "North-west corner, least cost, or Vogel's (usually best).", goal: 'Minimise cost or maximise profit.',
    },
  },
  'assignment-problem': {
    howTo: ['Type the cost table: one row per person, one column per job, `;` between rows.', 'Choose minimise (cost) or maximise (profit).', "Press {button}. NETZ uses the Hungarian method."],
    help: { costs: 'Rows separated by `;`, numbers by spaces.', goal: 'Minimise cost or maximise profit.' },
  },
  'kuhn-tucker': {
    howTo: ['Type the objective f(x, y) and choose max or min.', 'Type the constraints separated by `;`: `2x + y <= 5; x >= 0`.', 'Press {button}.'],
    help: { f: 'The function to optimise.', goal: 'Maximise or minimise.', constraints: 'Inequalities separated by `;`.' },
    maths: ['f'],
  },
};

export default GUIDES;
