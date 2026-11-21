// Guide mode words for the Unit 7 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const GUIDES = {
  quadratic: {
    howTo: [
      "Write your equation in the form **ax² + bx + c = 0** (move everything to one side).",
      "Type the three numbers a, b and c. For 2x² − 7x + 3 = 0: a = `2`, b = `-7`, c = `3`. A missing term is `0`.",
      "Press {button} for the discriminant, the roots (by formula and by factoring when possible) and the graph.",
    ],
    help: {
      a: "The number in front of x². It cannot be 0.",
      b: "The number in front of x (with its sign).",
      c: "The number on its own (the constant term).",
    },
  },
  'system-of-equations': {
    howTo: [
      "Choose 2 or 3 equations, and the method your teacher wants (elimination, Cramer's rule …).",
      "Write each equation with x, y (and z) in the same order on the left and the number on the right: `2x + 3y = 7`.",
      "In each row, type the numbers in front of x, y, z, then the number after the = sign. A missing letter is `0`.",
      "Press {button}.",
    ],
  },
  progressions: {
    howTo: [
      "Choose what you want: an AP (same difference each time), a GP (same ratio each time), or to identify a list.",
      "Type the first term a and the common difference d (or ratio r), and n.",
      "Press {button} for the nth term, the sum of n terms and the working.",
    ],
    help: {
      mode: "AP: 2, 5, 8 … (add the same number). GP: 2, 6, 18 … (multiply by the same number).",
      a: "The first term.",
      d: "The common difference: the second term minus the first.",
      r: "The common ratio: the second term divided by the first.",
      n: "Which term, or how many terms to add.",
      terms: "A list of terms separated by commas, to find out what kind of series it is.",
    },
  },
  'permutations-combinations': {
    howTo: [
      "Choose what you are counting: arrangements (order matters), selections (order does not matter), or a special case.",
      "Type n (how many items in total) and r (how many you pick).",
      "Press {button} for the formula with your numbers and the answer.",
    ],
    help: {
      mode: "Permutation nPr: order matters (ranking, seating). Combination nCr: order does not matter (a team).",
      n: "The total number of items to choose from.",
      r: "How many you choose or arrange.",
      necklace: "A necklace can be flipped over; a round table cannot.",
    },
  },
  'binomial-theorem': {
    howTo: [
      "Choose what to find: the whole expansion, a particular term, or the term with a given power of x.",
      "Write the bracket as (a + b)ⁿ and type a, b and n: for (2x − 3)⁵, a = `2x`, b = `-3`, n = `5`.",
      "Press {button}.",
    ],
    help: {
      mode: "Expansion: every term. General term: the rth term. Power of x: the term containing xᵏ.",
      a: "The first term in the bracket, e.g. `2x` or `x^2`.",
      b: "The second term, with its sign, e.g. `-3` or `1/x`.",
      n: "The power of the bracket, 0 to 15.",
      r: "Which term: 1 for the first, 2 for the second …",
      k: "The power of x you are looking for (`0` for the term without x).",
    },
    maths: ['a', 'b'],
  },
  'complex-numbers': {
    howTo: [
      "Choose the operation: add, multiply, divide, modulus and argument, polar form, powers or roots.",
      "Type the numbers as a + bi: `3 + 4i`, `2 - i`, `-5i`.",
      "Press {button}.",
    ],
    help: {
      op: "What to do with the numbers.",
      z1: "The first complex number, e.g. `3 + 4i`.",
      z2: "The second complex number.",
      n: "The power (or which roots) for De Moivre's theorem.",
    },
  },
  'domain-range': {
    howTo: ["Choose what to find: domain and range, or a composite f(g(x)).", "Type the function(s) in x.", "Press {button}."],
    help: { mode: "What you want to find.", f: "The function f(x): `sqrt(x - 2)/(x - 5)`.", g: "The second function g(x)." },
    maths: ['f', 'g'],
  },
  factoring: {
    howTo: ["Type the polynomial, e.g. `x^2 + 5x + 6` or `2x^3 - 3x^2 - 11x + 6`.", "Press {button}. Each step names the method (common factor, identity, splitting the middle term, factor theorem)."],
    help: { f: "One variable, whole-number powers: `x^3 - 6x^2 + 11x - 6`." },
    maths: ['f'],
  },
  inequalities: {
    howTo: ["Type the inequality with <, >, <= or >=: `x^2 - 5x + 6 <= 0`.", "Press {button} for the critical points, the sign chart and the answer as an interval."],
    help: { ineq: "Use `<=` for ≤ and `>=` for ≥. Fractions of polynomials are fine." },
    maths: ['ineq'],
  },
  'linear-equation': {
    howTo: ["Type the equation with its = sign: `3(x - 2) + 4 = 2x + 7`.", "Press {button}. Each step does the same thing to both sides."],
    help: { eq: "One unknown (x, y, t …). Fractions like `x/3` are fine." },
    maths: ['eq'],
  },
  logarithms: {
    howTo: [
      "Choose what to do: evaluate a log, solve an equation, or expand/condense.",
      "Type the base and number (or the equation, or the expression).",
      "Press {button}.",
    ],
    help: {
      mode: "Evaluate: log_b(x). Solve: an equation with powers or logs. Expand: break one log into several.",
      b: "The base: `10`, `2`, `e`.",
      x: "The number inside the log.",
      eq: "An equation like `2^(x+1) = 8` or `log(x) + log(x-3) = 1`.",
      expr: "What is inside the log, e.g. `x^2 y / z^3`.",
    },
    maths: ['eq', 'expr'],
  },
  'rational-expressions': {
    howTo: ["Type the expression with brackets around each top and bottom: `(x^2 - 1)/(x^2 + 2x + 1)`.", "Press {button} to simplify, showing the factors that cancel."],
    help: { expr: "You can add, subtract, multiply and divide fractions." },
    maths: ['expr'],
  },
  'set-operations': {
    howTo: [
      "Choose what to find: a set formula, a Venn diagram, or the properties of a relation.",
      "Type the sets with commas between elements: A = `2, 4, 6`.",
      "Type the formula, e.g. `(A ∪ B)' ∩ C` (you can write | for ∪ and & for ∩). Press {button}.",
    ],
    help: {
      mode: "Sets or relations.",
      U: "Optional: everything under consideration, needed for complements (').",
      A: "The elements of A, separated by commas.",
      B: "The elements of B.",
      C: "Optional third set.",
      expression: "Use ∪ or |, ∩ or &, − for difference, ' for complement.",
      relation: "Ordered pairs: `(1,1), (1,2), (2,1)`.",
    },
  },
};

export default GUIDES;
