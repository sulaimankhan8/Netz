/**
 * Unit 6–15 tasks: one per method page (owner's choice 2026-11-09, Option B on the medals board;
 * docs/rewards/NETZ_MEDALS_CATALOG.md section 2b). Each task is "solve this page once" and gives its medal.
 * The task list is built from methods.js, so a page's task shows up the day the page goes live
 * and stays hidden while it is 'building'. A new page needs a medal name here and an emblem in
 * components/mascot/unitEmblems.js (check:methods fails without them).
 */

import { METHODS } from '@/app/data/methods';

// Colours from the board: top half, bottom half, rim
export const UNIT_GROUPS = {
  unit6: { name: 'Unit 6', fill: '#D55E64', fill2: '#FBAE3D', rim: '#A63E48' },
  unit7: { name: 'Unit 7', fill: '#FBAE3D', fill2: '#96456E', rim: '#6C2C4E' },
  unit8: { name: 'Unit 8', fill: '#132034', fill2: '#D55E64', rim: '#0C1626' },
  unit9: { name: 'Unit 9', fill: '#96456E', fill2: '#FBAE3D', rim: '#6C2C4E' },
  unit10: { name: 'Unit 10', fill: '#FBAE3D', fill2: '#132034', rim: '#C98318' },
  unit11: { name: 'Unit 11', fill: '#F4F4F2', fill2: '#132034', rim: '#132034' },
  unit12: { name: 'Unit 12', fill: '#132034', fill2: '#F88F4A', rim: '#0C1626' },
  unit13: { name: 'Unit 13', fill: '#4D345E', fill2: '#D55E64', rim: '#33213F' },
  unit14: { name: 'Unit 14', fill: '#4D345E', fill2: '#FBAE3D', rim: '#33213F' },
  unit15: { name: 'Unit 15', fill: '#141415', fill2: '#F88F4A', rim: '#000000' },
};

// Medal name for each method id
export const UNIT_MEDALS = {
  // Unit 6: calculus
  limit: 'Edge Walker',
  derivative: 'Slope Seeker',
  integral: 'Area Sweeper',
  'first-principles': 'From Scratch',
  implicit: 'Hidden Slope',
  logarithmic: 'Log Slider',
  parametric: 'Path Tracer',
  'tangent-normal': 'Right Angle',
  monotonicity: 'Up and Down',
  'maxima-minima': 'Peak Finder',
  'area-under-curve': 'Region Painter',
  'taylor-series': 'Series Builder',
  'partial-derivative': 'Slice Cutter',
  'euler-homogeneous': 'Even Scaler',
  jacobian: 'Grid Warper',
  'maxima-minima-2var': 'Saddle Rider',
  'lagrange-multipliers': 'Constraint Keeper',
  'taylor-2var': 'Surface Hugger',
  'double-integral': 'Double Layer',
  'change-of-order': 'Order Swapper',
  'triple-integral': 'Cube Counter',
  'beta-gamma': 'Factorial Bridge',
  'convergence-tests': 'Converger',
  'power-series': 'Radius Ranger',
  'fourier-series': 'Wave Builder',
  'harmonic-analysis': 'Harmonic Ear',
  'grad-div-curl': 'Field Reader',
  'trig-integrals': 'Sine Sweeper',
  'improper-integrals': 'Infinity Reach',
  'volume-revolution': 'Volume Spinner',
  'arc-length': 'Curve Measurer',
  'nth-derivative': 'Leibniz Ladder',
  'mean-value-theorem': 'Mean Line',
  'errors-approximations': 'Small Change',
  continuity: 'No Gaps',
  asymptotes: 'Line Chaser',
  'related-rates': 'Rate Linker',
  optimization: 'Best Box',
  'line-integral': 'Path Walker',
  'surface-integral': 'Flux Catcher',
  'greens-theorem': 'Loop Closer',
  'stokes-theorem': 'Cap Spinner',
  'divergence-theorem': 'Outflow',
  'centre-of-mass': 'Balance Point',
  'reduction-formula': 'Step Down',
  'leibniz-integral-rule': 'Under the Sign',
  'curvature-calculator': 'Curve Hugger',

  // Unit 7: algebra
  quadratic: 'Root Cracker',
  'system-of-equations': 'Crossing Lines',
  progressions: 'Pattern Spotter',
  'permutations-combinations': 'Arranger',
  'linear-equation': 'Balance Keeper',
  factoring: 'Factor Finder',
  inequalities: 'Range Marker',
  'rational-expressions': 'Fraction Folder',
  'binomial-theorem': "Pascal's Peak",
  'complex-numbers': 'Imaginary Friend',
  logarithms: 'Log Lifter',
  'domain-range': 'Domain Ranger',
  'set-operations': 'Set Builder',

  // Unit 8: matrices
  determinant: 'Cross Multiplier',
  'matrix-inverse': 'Undo Master',
  rank: 'Echelon Stair',
  'matrix-calculator': 'Grid Master',
  consistency: 'System Solver',
  'linear-dependence': 'Line Up',
  eigenvalues: 'Eigen Eye',
  'cayley-hamilton': 'Self Solver',
  vectors: 'Arrow Aimer',
  diagonalization: 'Diagonal Line',
  'quadratic-form': 'Bowl Shaper',
  'svd-calculator': 'Stretch Spinner',
  'linear-transformations': 'Space Mover',

  // Unit 9: geometry and trigonometry
  'area-perimeter': 'Fence Builder',
  'volume-surface-area': 'Box Filler',
  pythagoras: 'Square Sum',
  'triangle-solver': 'Triangle Tamer',
  'unit-circle': 'Wave Rider',
  'coordinate-geometry': 'Point Plotter',
  circles: 'Ring Maker',
  conics: 'Cone Cutter',
  'heights-distances': 'Tower Gazer',
  'trig-identities': 'Identity Checker',
  'trig-equations': 'Angle Finder',
  'inverse-trig': 'Angle Back',
  'geometry-3d': 'Space Plotter',
  'polar-coordinates': 'Rose Drawer',

  // Unit 10: interest and finance
  percentage: 'Percent Pro',
  'compound-interest': 'Interest Earner',
  emi: 'EMI Planner',
  fd: 'Locked Saver',
  rd: 'Monthly Saver',
  ppf: 'Long Haul',
  sip: 'Steady Investor',
  lumpsum: 'Lump Sum Hero',
  tvm: 'Time Traveller',
  'npv-irr': 'Cash Flow Reader',
  cagr: 'Growth Grower',
  depreciation: 'Value Slider',
  'bill-discounting': 'Bill Discounter',

  // Unit 11: taxes
  gst: 'Bill Checker',
  vat: 'World Shopper',
  'sales-tax': 'Checkout Champ',
  'canada-sales-tax': 'Maple Ledger',
  'income-tax': 'Tax Filer',
  'capital-gains-india': 'Gain Spotter',
  'hra-exemption': 'Rent Saver',
  tds: 'Source Cutter',
  'us-income-tax': 'Bracket Climber',
  'uk-income-tax': 'Band Reader',
  'corporate-tax-calculator': 'Company Clerk',

  // Unit 12: differential equations
  'ode-solver': 'First Steps',
  'variable-separable': 'Splitter',
  'homogeneous-ode': 'Ray Rider',
  'linear-ode': 'Factor Lifter',
  bernoulli: 'Power Tamer',
  'exact-ode': 'Exact Match',
  'ode-cc': 'Spring Solver',
  'variation-of-parameters': 'Parameter Shifter',
  'cauchy-euler': 'Power Ladder',
  'clairaut-equation': 'Envelope Maker',
  'simultaneous-differential-equations': 'Twin Tracker',
  'ode-applications': 'Cooling Cup',
  'series-solution-ode': 'Term Stacker',
  'formation-of-pde': 'Equation Former',
  'lagrange-linear-pde': 'Curve Follower',
  'charpit-method': 'Charpit Climber',
  'pde-constant-coefficients': 'Wave Maker',
  'separation-of-variables': 'Heat Spreader',

  // Unit 13: transforms
  laplace: 'Laplace Lens',
  'inverse-laplace': 'Back Through',
  'unit-step': 'Switch Flipper',
  'laplace-ode': 'Transform Solver',
  'dft-fft': 'Butterfly',
  'fourier-transform': 'Frequency Finder',
  'z-transform': 'Sample Stacker',
  'inverse-z': 'Sequence Finder',
  'difference-equation-z': 'Step Predictor',
  'complex-fourier-series': 'Spinning Circles',

  // Unit 14: complex variables
  'cauchy-riemann': 'Smooth Operator',
  'harmonic-conjugate': 'Perfect Partner',
  'cauchy-integral': 'Circle Integrator',
  'laurent-series': 'Ring Reader',
  residues: 'Residue Hunter',
  'contour-integration': 'Contour Drawer',
  bilinear: 'Map Bender',

  // Unit 15: discrete maths and optimisation
  'truth-table': 'Logic Gate',
  'modular-arithmetic': 'Clock Counter',
  dijkstra: 'Path Finder',
  'bfs-dfs': 'Tree Explorer',
  mst: 'Tree Spanner',
  simplex: 'Corner Finder',
  'recurrence-relations': 'Next Term',
  'k-map-simplifier': 'Map Grouper',
  'transportation-problem': 'Route Planner',
  'assignment-problem': 'Match Maker',
  'kuhn-tucker': 'Edge Optimiser',
};

/** Every Unit 6–15 method page, live or not, as a task (check:methods uses this). */
export const ALL_UNIT_TASKS = METHODS.filter((m) => m.unit >= 6).map((m) => ({
  id: `unit${m.unit}.${m.id}`,
  group: `unit${m.unit}`,
  name: m.name,
  medal: UNIT_MEDALS[m.id] || m.name,
  href: m.route,
  method: m.id,
  live: m.status === 'live',
  matches: (a) => a.kind === 'solver.run' && a.details.method === m.id,
}));

/** The tasks students see: live pages only. */
export const UNIT_TASKS = ALL_UNIT_TASKS.filter((t) => t.live);
