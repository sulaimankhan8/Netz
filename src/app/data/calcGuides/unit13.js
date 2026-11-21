// Guide mode words for the Unit 13 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const GUIDES = {
  laplace: {
    howTo: ['Type f(t) using t: `t^2 e^(-t) + cos(2t)`.', 'Press {button}. Each step names the rule (linearity, shifting, table entry …).'],
    help: { f: 'The function of t.' },
    maths: ['f'],
  },
  'inverse-laplace': {
    howTo: ['Choose the method: partial fractions or convolution.', 'Type F(s), e.g. `(s + 1)/(s^2 + 2s + 5)`.', 'Press {button} for f(t).'],
    help: { mode: 'Partial fractions for most questions; convolution for a product F₁(s)·F₂(s).', F: 'The function of s.', F2: 'For convolution: the second factor.' },
    maths: ['F', 'F2'],
  },
  'laplace-ode': {
    howTo: ["Type the equation in t: `y'' + 4y = sin(t)`.", "Type the starting values: `y(0) = 1, y'(0) = 0`.", 'Press {button}. NETZ transforms, solves for Y(s) and transforms back.'],
    help: { eq: "Use `y'` and `y''` for the derivatives.", ics: 'Values at t = 0.' },
    maths: ['eq'],
  },
  'unit-step': {
    howTo: ['Choose how your function is given: in pieces, as a periodic function, or with u(t − a) already.', 'Type it: pieces separated by `;` like `t for 0 < t < 1; 1 for t > 1`.', 'Press {button}.'],
    help: { mode: 'Pieces, periodic, or written with unit steps.', pieces: 'Each piece with its range, separated by `;`.', period: 'The period T, e.g. `2pi`.', f: 'Written with `u(t - a)` and `δ(t - a)`.' },
    maths: ['f'],
  },
  'fourier-transform': {
    howTo: ['Choose the transform: complex, sine or cosine.', 'Type f(x); it is zero outside the pieces you give: `1 for |x| < 1`.', 'Press {button}.'],
    help: { mode: 'Which Fourier transform.', f: 'The function, as one formula or pieces.' },
    maths: ['f'],
  },
  'complex-fourier-series': {
    howTo: ['Type f(x) (one formula or pieces).', 'Type the interval, e.g. `-pi` to `pi`.', 'Press {button} for the coefficients cₙ.'],
    help: { f: 'The function over one period.', from: 'Start of the period.', to: 'End of the period.' },
    maths: ['f'],
  },
  'dft-fft': {
    howTo: ['Choose DFT, FFT or the inverse.', 'Type the values separated by commas: `1, 2, 3, 4` (FFT needs 2, 4, 8 … values).', 'Press {button}.'],
    help: { mode: 'Which transform.', x: 'The sequence, separated by commas.' },
  },
  'z-transform': {
    howTo: ['Type x(n) using n: `n 2^n`.', 'Press {button}.'],
    help: { x: 'The sequence for n ≥ 0.' },
    maths: ['x'],
  },
  'inverse-z': {
    howTo: ['Type F(z), e.g. `z/((z - 1)(z - 2))`.', 'Choose how many terms to show by long division.', 'Press {button}.'],
    help: { F: 'The function of z.', terms: 'How many terms of the sequence to list.' },
    maths: ['F'],
  },
  'difference-equation-z': {
    howTo: ['Type the difference equation: `y(n+2) - 3y(n+1) + 2y(n) = 0`.', 'Type the starting values: `y(0) = 0, y(1) = 1`.', 'Press {button}.'],
    help: { eq: 'Use y(n), y(n+1), y(n+2).', ics: 'The first values of y.' },
    maths: ['eq'],
  },
};

export default GUIDES;
