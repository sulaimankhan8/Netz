// Where the app's menus link to. Shared by the laptop side bar and the phone navigation.
import {
  FiHome,
  FiGrid,
  FiFileText,
  FiSliders,
  FiUser,
  FiZap,
  FiTag
} from 'react-icons/fi';

// Unified Navigation Schema (Badges removed as requested)
export const PRIMARY_NAV = [
  { title: 'Home', route: '/', icon: FiHome },
  { title: 'Algorithms Hub', route: '/Algorithems', icon: FiGrid },
  { title: 'Playground', route: '/Playground', icon: FiZap },
  { title: 'Notes Studio', route: '/Notes', icon: FiFileText },
  { title: 'Settings', route: '/Setting', icon: FiSliders },
  { title: 'Profile', route: '/Profile', icon: FiUser },
  { title: 'Pricing', route: '/Pricing', icon: FiTag },
];

// Full 3-Level Deep Units Structure (Matching Sidenav.js perfectly)
export const UNITS_DATA = [
  {
    id: 'unit-1',
    title: 'Unit 1: Equations & Systems',
    shortTitle: 'Unit 1',
    description: 'Root Finding & Linear Systems',
    subTopics: [
      { title: 'Bisection Method', link: '/bisection-method' },
      { title: 'Secant Method', link: '/secant-method' },
      { title: 'Iteration Method', link: '/iteration-method' },
      { title: 'False Position Method', link: '/false-position-method' },
      { title: 'Newton-Raphson Method', link: '/newton-raphson-method' },
    ]
  },
  {
    id: 'unit-2',
    title: 'Unit 2: Interpolation',
    shortTitle: 'Unit 2',
    description: 'Equal & Unequal Intervals',
    subTopics: [
      {
        title: 'Interpolation for Equal Intervals',
        subTopics: [
          { title: "Newton's Forward Formula", link: '/newton-forward' },
          { title: "Newton's Backward Formula", link: '/newton-backward' },
          { title: 'Gauss Forward Formula', link: '/gauss-forward' },
          { title: 'Gauss Backward Formula', link: '/gauss-backward' },
        ],
      },
      {
        title: 'Interpolation for Unequal Intervals',
        subTopics: [
          { title: "Newton's Divided Difference Formula", link: '/newton-divided' },
          { title: "Lagrange's Interpolation Formula", link: '/lagrange-interpolation' },
        ],
      },
    ],
  },
  {
    id: 'unit-3',
    title: 'Unit 3: Differentiation & Integration',
    shortTitle: 'Unit 3',
    description: 'Calculus & Quadrature Rules',
    subTopics: [
      { title: 'Numerical Differentiation', link: '/numerical-differentiation' },
      {
        title: 'Numerical Integration',
        subTopics: [
          { title: 'Trapezoidal Rule', link: '/trapezoidal-Rule' },
          { title: "Simpson's 1/3 Rule", link: '/simpson-1-3-Rule' },
          { title: "Simpson's 3/8 Rule", link: '/simpson-3-8-Rule' },
          { title: "Boole's Rule", link: '/boole-Rule' },
          { title: "Weddle's Rule", link: '/weddle-Rule' },
          { title: 'Gauss Quadrature', link: '/gauss-quadrature' },
        ],
      },
    ],
  },
  {
    id: 'unit-4',
    title: 'Unit 4: Matrix Methods & ODEs',
    shortTitle: 'Unit 4',
    description: 'Linear Algebra & Differential Equations',
    subTopics: [
      {
        title: 'Matrix Methods',
        subTopics: [
          { title: 'Gauss Seidel Method', link: '/Gauss-seidal' },
          { title: 'Gauss Elimination', link: '/gauss-elimination' },
          { title: 'Gauss-Jordan Elimination', link: '/gauss-jordan' },
          { title: 'LU Decomposition', link: '/lu-decomposition' },
          { title: 'Jacobi Method', link: '/jacobi-method' },
        ],
      },
      {
        title: 'ODE Methods',
        subTopics: [
          { title: "Taylor's Series Method", link: '/taylor-s-series-method' },
          { title: "Euler's Method", link: '/euler-s-method' },
          { title: "Modified Euler's Method", link: '/modified-euler-s-method' },
          { title: 'Runge-Kutta Methods', link: '/runge-kutta-method' },
        ],
      },
    ],
  },
  {
    id: 'unit-5',
    title: 'Unit 5: Curve Fitting & Hypothesis Testing',
    shortTitle: 'Unit 5',
    description: 'Regression & Statistical Tests',
    subTopics: [
      { title: 'Method of Least Squares', link: '/least-squares' },
      { title: 'Fitting of Straight Lines', link: '/fitting-straight-lines' },
      { title: 'Fitting of Second Degree Parabola', link: '/fitting-parabola' },
      {
        title: 'Testing of Hypothesis',
        subTopics: [
          { title: 'Test of Significance (Z-test)', link: '/test-significance' },
          { title: 't-test', link: '/t-test' },
          { title: 'F-test', link: '/f-test' },
          { title: 'Chi-Square Test', link: '/chi-square' },
        ],
      },
    ],
  },
];

/** Every method as one flat list: { title, link, unit, unitId, category }. */
export const ALL_METHODS = UNITS_DATA.flatMap((unit) =>
  unit.subTopics.flatMap((sub) =>
    sub.subTopics
      ? sub.subTopics.map((leaf) => ({ title: leaf.title, link: leaf.link, unit: unit.shortTitle, unitId: unit.id, category: sub.title }))
      : [{ title: sub.title, link: sub.link, unit: unit.shortTitle, unitId: unit.id, category: null }]
  )
);

/** Methods whose title, category or unit match the search text. */
export function searchMethods(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_METHODS.filter((m) =>
    m.title.toLowerCase().includes(q) || (m.category || '').toLowerCase().includes(q) || m.unit.toLowerCase().includes(q)
  );
}

/** The method page at this path, if any. */
export function methodAt(pathname) {
  return ALL_METHODS.find((m) => m.link === pathname) || null;
}
