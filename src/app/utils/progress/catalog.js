/**
 * Everything NETZ counts as progress: the 50 tasks, 5 onboarding tasks, 20 streak medals and the gem
 * amounts (NETZ_TASK_SHEET.md, NETZ_LAUNCH_PLAN.md section 2). The engine (engine.js) only reads this
 * file, so adding or renaming a task is a change here and nowhere else.
 */

export const GEMS = {
  firstTime: 20,
  repeat: 5,
  onboarding: 25,
  dailyGoal: 15,
  monthMedal: 200,
  // Repeats plus the daily-goal bonus never give more than this in one day
  dailyCap: 60,
};

export const DAILY_GOAL_TASKS = 3;
export const MONTH_MEDAL_DAYS = 20;
export const MAX_FREEZES = 2;

// Colours come from the bg1 sunset palette (NETZ_MEDALS_CATALOG.md section 1)
export const GROUPS = {
  unit1: { name: 'Unit 1', fill: '#D55E64', rim: '#A63E48' },
  unit2: { name: 'Unit 2', fill: '#FBAE3D', rim: '#C98318' },
  unit3: { name: 'Unit 3', fill: '#96456E', rim: '#6C2C4E' },
  unit4: { name: 'Unit 4', fill: '#2B4570', rim: '#0C1626' },
  unit5: { name: 'Unit 5', fill: '#5E3F75', rim: '#33213F' },
  notes: { name: 'Notes', fill: '#F4F4F2', rim: '#96456E' },
  playground: { name: 'Playground', fill: '#F88F4A', rim: '#C2632A' },
  sharing: { name: 'Sharing', fill: '#D55E64', rim: '#FBAE3D' },
};

/** A task finished by one solver run of `method`. */
const solve = (id, group, method, name, medal, href) => ({
  id, group, name, medal, href,
  matches: (a) => a.kind === 'solver.run' && a.details.method === method,
});

/** A task finished by one activity kind, optionally with a details check. */
const on = (id, group, kind, name, medal, href, test = () => true) => ({
  id, group, name, medal, href,
  matches: (a) => a.kind === kind && test(a.details || {}),
});

// Root methods that solve f(x) = 0 directly, so two of them on the same f(x) can be compared
const ROOT_METHODS = ['bisection', 'false-position', 'newton-raphson', 'secant'];
const RULE_METHODS = ['trapezoidal', 'simpson-13', 'simpson-38', 'boole', 'weddle', 'gauss-quadrature'];

const sameExpression = (fn) => String(fn || '').replace(/\s+/g, '').toLowerCase();

export const TASKS = [
  // Unit 1: roots and systems
  solve('unit1.bisection', 'unit1', 'bisection', 'Solve with Bisection', 'Halfway Hero', '/bisection-method'),
  solve('unit1.false-position', 'unit1', 'false-position', 'Solve with False Position', 'Chord Cutter', '/false-position-method'),
  solve('unit1.newton-raphson', 'unit1', 'newton-raphson', 'Solve with Newton-Raphson', 'Tangent Rider', '/newton-raphson-method'),
  solve('unit1.secant', 'unit1', 'secant', 'Solve with Secant', 'Two-Point Shot', '/secant-method'),
  solve('unit1.fixed-point', 'unit1', 'fixed-point', 'Solve with Iteration', 'Cobweb Climber', '/iteration-method'),
  solve('unit1.gauss-seidel', 'unit1', 'gauss-seidel', 'Solve with Gauss-Seidel', 'Seidel Spinner', '/Gauss-seidal'),
  {
    id: 'unit1.root-rivals', group: 'unit1', name: 'Solve one function with 2 root methods', medal: 'Root Rivals',
    href: '/bisection-method',
    // Checked against recent solves, because it needs two runs
    matchesHistory: (a, recent) => {
      if (a.kind !== 'solver.run' || !ROOT_METHODS.includes(a.details.method) || !a.details.fn) return false;
      const fn = sameExpression(a.details.fn);
      return recent.some((r) => ROOT_METHODS.includes(r.method) && r.method !== a.details.method && sameExpression(r.fn) === fn);
    },
  },

  // Unit 2: interpolation
  solve('unit2.newton-forward', 'unit2', 'newton-forward', 'Newton Forward interpolation', 'Forward Stepper', '/newton-forward'),
  solve('unit2.newton-backward', 'unit2', 'newton-backward', 'Newton Backward interpolation', 'Backward Stepper', '/newton-backward'),
  solve('unit2.gauss-forward', 'unit2', 'gauss-forward', 'Gauss Forward interpolation', 'Zigzag Forward', '/gauss-forward'),
  solve('unit2.gauss-backward', 'unit2', 'gauss-backward', 'Gauss Backward interpolation', 'Zigzag Back', '/gauss-backward'),
  solve('unit2.lagrange', 'unit2', 'lagrange', 'Lagrange interpolation', 'Point Weaver', '/lagrange-interpolation'),
  solve('unit2.newton-divided', 'unit2', 'newton-divided', 'Newton Divided Difference', 'Divider', '/newton-divided'),
  on('unit2.big-table', 'unit2', 'solver.run', 'Interpolate with 6 or more points', 'Big Table', '/lagrange-interpolation',
    (d) => d.unit === 2 && Number(d.points) >= 6),

  // Unit 3: integration and differentiation
  solve('unit3.trapezoidal', 'unit3', 'trapezoidal', 'Trapezoidal rule', 'Strip Builder', '/trapezoidal-Rule'),
  solve('unit3.simpson-13', 'unit3', 'simpson-13', "Simpson's 1/3 rule", 'Arc Pair', '/simpson-1-3-Rule'),
  solve('unit3.simpson-38', 'unit3', 'simpson-38', "Simpson's 3/8 rule", 'Triple Arc', '/simpson-3-8-Rule'),
  solve('unit3.boole', 'unit3', 'boole', "Boole's rule", "Boole's Five", '/boole-Rule'),
  solve('unit3.weddle', 'unit3', 'weddle', "Weddle's rule", 'Wave of Six', '/weddle-Rule'),
  solve('unit3.gauss-quadrature', 'unit3', 'gauss-quadrature', 'Gauss Quadrature', 'Sharp Sampler', '/gauss-quadrature'),
  solve('unit3.differentiation', 'unit3', 'numerical-differentiation', 'Numerical Differentiation', 'Slope Spotter', '/numerical-differentiation'),
  {
    id: 'unit3.rule-trio', group: 'unit3', name: 'Same integral with 3 rules', medal: 'Rule Trio', href: '/trapezoidal-Rule',
    matchesHistory: (a, recent) => {
      if (a.kind !== 'solver.run' || !RULE_METHODS.includes(a.details.method) || !a.details.fn) return false;
      const key = `${sameExpression(a.details.fn)}|${a.details.a}|${a.details.b}`;
      const methods = new Set([a.details.method]);
      recent.forEach((r) => {
        if (RULE_METHODS.includes(r.method) && `${sameExpression(r.fn)}|${r.a}|${r.b}` === key) methods.add(r.method);
      });
      return methods.size >= 3;
    },
  },

  // Unit 4: ODEs and matrices
  solve('unit4.euler', 'unit4', 'euler', "Euler's method", 'Step Walker', '/euler-s-method'),
  solve('unit4.modified-euler', 'unit4', 'modified-euler', 'Modified Euler', 'Second Guess', '/modified-euler-s-method'),
  solve('unit4.runge-kutta', 'unit4', 'runge-kutta', 'Runge-Kutta', 'Four Slopes', '/runge-kutta-method'),
  solve('unit4.taylor', 'unit4', 'taylor', 'Taylor Series', 'Close Hugger', '/taylor-s-series-method'),
  solve('unit4.gauss-elimination', 'unit4', 'gauss-elimination', 'Gauss Elimination', 'Zero Maker', '/gauss-elimination'),
  solve('unit4.gauss-jordan', 'unit4', 'gauss-jordan', 'Gauss-Jordan', 'Diagonal Shine', '/gauss-jordan'),
  solve('unit4.jacobi', 'unit4', 'jacobi', 'Jacobi method', 'Jacobi Loop', '/jacobi-method'),
  solve('unit4.lu', 'unit4', 'lu', 'LU Decomposition', 'Split Matrix', '/lu-decomposition'),

  // Unit 5: statistics
  solve('unit5.chi-square', 'unit5', 'chi-square', 'Chi-square test', 'Chi Tail', '/chi-square'),
  solve('unit5.f-test', 'unit5', 'f-test', 'F-test', 'Spread Judge', '/f-test'),
  solve('unit5.t-test', 'unit5', 't-test', 't-test', 't-Bell', '/t-test'),
  solve('unit5.significance', 'unit5', 'z-test', 'Test of Significance', 'Significant!', '/test-significance'),
  solve('unit5.straight-line', 'unit5', 'straight-line', 'Fit a Straight Line', 'Line Fitter', '/fitting-straight-lines'),
  solve('unit5.parabola', 'unit5', 'parabola', 'Fit a Parabola', 'Curve Fitter', '/fitting-parabola'),
  solve('unit5.least-squares', 'unit5', 'least-squares', 'Least Squares', 'Square Keeper', '/least-squares'),

  // Notes
  on('notes.three-blocks', 'notes', 'note.saved', 'Write a note with 3 or more blocks', 'Note Builder', '/Notes', (d) => Number(d.blocks) >= 3),
  on('notes.widget', 'notes', 'note.saved', 'Put a solver widget in a note', 'Live Page', '/Notes', (d) => !!d.hasWidget),
  on('notes.math', 'notes', 'note.saved', 'Write a maths block', 'Math Scribe', '/Notes', (d) => !!d.hasMath),
  on('notes.quiz-made', 'notes', 'note.saved', 'Make a quiz block', 'Quiz Maker', '/Notes', (d) => !!d.hasQuiz),
  on('notes.quiz-correct', 'notes', 'quiz.correct', 'Answer a quiz correctly', 'Quiz Ace', '/Notes'),
  on('notes.pdf', 'notes', 'note.exported', 'Export a note as PDF', 'Print Ready', '/Notes', (d) => d.kind === 'pdf'),

  // Playground
  on('playground.ink-math', 'playground', 'ink.converted', 'Turn handwritten maths into an equation', 'Ink to Math', '/Playground', (d) => d.kind === 'math'),
  on('playground.ink-text', 'playground', 'ink.converted', 'Turn handwritten words into text', 'Ink to Words', '/Playground', (d) => d.kind === 'text'),
  on('playground.eval', 'playground', 'playground.eval', 'Get a live "=" answer', 'Instant Answer', '/Playground'),
  on('playground.graph', 'playground', 'playground.block', 'Make a graph block', 'Graph Maker', '/Playground', (d) => d.type === 'graph'),
  on('playground.shape', 'playground', 'playground.block', 'Insert a shape or symbol', 'Shape Shifter', '/Playground', (d) => d.type === 'shape' || d.type === 'symbol'),
  on('playground.export', 'playground', 'page.exported', 'Export a page', 'Page Out', '/Playground'),

  // Sharing (needs the backend; the activity is never sent until publishing exists)
  on('sharing.publish', 'sharing', 'note.published', 'Publish a note to the web', 'Publisher', '/Notes'),
];

export const ONBOARDING = [
  { id: 'onboard.meet-robot', name: 'Name the robot and pick your units', medal: 'Power On', matches: (a) => a.kind === 'robot.named' },
  { id: 'onboard.first-solve', name: 'Run your first algorithm', medal: 'First Spark', matches: (a) => a.kind === 'solver.run' },
  { id: 'onboard.first-note', name: 'Write your first note', medal: 'First Page', matches: (a) => a.kind === 'note.saved' },
  { id: 'onboard.first-ink', name: 'Draw and convert ink in the Playground', medal: 'First Stroke', matches: (a) => a.kind === 'ink.converted' },
  { id: 'onboard.account', name: 'Create an account', medal: 'Cloud Link', matches: (a) => a.kind === 'account.created' },
];

const tier = (name, gems) => ({ name, gems });
const TIERS = {
  coral: tier('Coral', 20),
  orange: tier('Orange', 50),
  amber: tier('Amber', 100),
  cream: tier('Cream', 250),
  plum: tier('Plum', 500),
  purple: tier('Purple', 500),
  night: tier('Night', 500),
};

export const STREAK_MEDALS = [
  [1, 'coral'], [5, 'coral'], [10, 'coral'],
  [25, 'orange'], [50, 'orange'], [75, 'orange'],
  [100, 'amber'], [150, 'amber'], [200, 'amber'],
  [250, 'cream'], [300, 'cream'], [365, 'cream'],
  [400, 'plum'], [450, 'plum'], [500, 'plum'],
  [600, 'purple'], [700, 'purple'], [800, 'purple'],
  [900, 'night'], [1000, 'night'],
].map(([days, t]) => ({ id: `streak.${days}`, days, tier: t, tierName: TIERS[t].name, gems: TIERS[t].gems }));

export const TASK_BY_ID = Object.fromEntries([...TASKS, ...ONBOARDING].map((t) => [t.id, t]));
