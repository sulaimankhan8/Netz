// Guide mode words for the Unit 14 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const Z = 'A complex number like `1 + 2i`, `-i` or `inf` (∞).';

const GUIDES = {
  'cauchy-riemann': {
    howTo: ['Choose what you have: f(z), or u and v.', 'Type it: f(z) = `z^2 + 2z`, or u = `x^2 - y^2` and v = `2xy`.', 'Press {button}. NETZ checks uₓ = v_y and u_y = −vₓ.'],
    help: { mode: 'f(z) as a formula in z, or its real and imaginary parts.', f: 'A formula in z.', u: 'The real part, in x and y.', v: 'The imaginary part, in x and y.' },
    maths: ['f', 'u', 'v'],
  },
  'harmonic-conjugate': {
    howTo: ['Choose whether you know u or v.', 'Type it in x and y: `x^3 - 3x y^2`.', 'Press {button} for the other part and f(z).'],
    help: { given: 'The real part u or the imaginary part v.', w: 'The function you know, in x and y.' },
    maths: ['w'],
  },
  bilinear: {
    howTo: ['Choose what you have: three points and their images, or the four numbers a, b, c, d.', 'Type the complex numbers.', 'Press {button} for w = (az + b)/(cz + d).'],
    help: {
      mode: 'Three point pairs, or a, b, c, d.', z1: Z, w1: 'Where z₁ goes.', z2: Z, w2: 'Where z₂ goes.', z3: Z, w3: 'Where z₃ goes.',
      a: 'a in (az + b)/(cz + d).', b: 'b.', c: 'c.', d: 'd.', points: 'Optional: more points to map, separated by commas.',
    },
  },
  'cauchy-integral': {
    howTo: ['Type the integrand, e.g. `e^(2z)/(z + 1)^4`.', 'Type the circle: centre and radius.', "Press {button}. NETZ checks which points lie inside and applies Cauchy's formula."],
    help: { f: 'The function of z.', center: 'Centre of the circle.', radius: 'Radius of the circle.' },
    maths: ['f'],
  },
  residues: {
    howTo: ['Type f(z), e.g. `(z - 3)/(z^2 + 2z + 5)`.', 'Optionally type a circle to integrate round.', 'Press {button} for the poles, their residues and the integral.'],
    help: { f: 'The function of z.', center: 'Optional: centre of the circle.', radius: 'Optional: its radius.' },
    maths: ['f'],
  },
  'contour-integration': {
    howTo: ['Choose the kind of real integral: in θ (0 to 2π) or over the whole real line.', 'Type the integrand: `1/(5 + 4cos(θ))`.', 'Press {button}.'],
    help: { mode: 'Trigonometric (θ) or improper (−∞ to ∞).', f: 'The function to integrate.' },
    maths: ['f'],
  },
  'laurent-series': {
    howTo: ['Type f(z), e.g. `1/((z - 1)(z - 2))`.', 'Type the centre and, optionally, a radius to pick the ring.', 'Press {button}.'],
    help: { f: 'The function of z.', center: 'The point to expand about.', radius: 'Optional: a radius r; NETZ uses the ring that contains |z − z₀| = r.' },
    maths: ['f'],
  },
};

export default GUIDES;
