// Guide mode words for the Unit 3 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const GUIDES = {
  'double-integration': {
    howTo: [
      "Choose the rule: trapezoidal, or Simpson's (needs an even number of strips).",
      "Type the function of x and y to integrate, e.g. `1/(x+y)`. Write a product of letters as `x*y`.",
      "Type the limits: x from … to …, and y from … to ….",
      "Type how many strips to cut each direction into, then press {button} to see the grid of values and the sum.",
    ],
    help: {
      rule: "Trapezoidal works with any number of strips; Simpson's is more accurate but needs an even number.",
      f: "The function being integrated, using x and y: `1/(x+y)`, `x*y^2`.",
      a: "Lower limit for x.",
      b: "Upper limit for x.",
      c: "Lower limit for y.",
      d: "Upper limit for y.",
      m: "How many equal strips in the x direction.",
      n: "How many equal strips in the y direction.",
    },
    maths: ['f'],
  },
  'monte-carlo-integration': {
    howTo: [
      "Choose the method (average of f, or hit-or-miss).",
      "Type the function and the limits a to b.",
      "Choose how many random points N to use: more points give a better estimate.",
      "Press {button}. The seed fixes the random numbers, so the same seed gives the same answer.",
    ],
    help: {
      mode: "Mean value: average f at random points. Hit-or-miss: count random points under the curve.",
      f: "The function to integrate, in x: `x^2`.",
      a: "Lower limit.",
      b: "Upper limit.",
      N: "How many random points. 1000 gives roughly 2 correct decimals.",
      seed: "Any whole number. Change it to get a different set of random points.",
    },
    maths: ['f'],
  },
  romberg: {
    howTo: [
      "Type the function to integrate, e.g. `1/(1+x^2)`.",
      "Type the lower and upper limits.",
      "Choose how many rows of the Romberg table to build (4 is usual).",
      "Press {button} to see the trapezoidal values and each improved column.",
    ],
  },
};

export default GUIDES;
