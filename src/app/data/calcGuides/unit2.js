// Guide mode words for the Unit 2 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const GUIDES = {
  bessel: {
    howTo: [
      "Copy the **x values** of your table, separated by commas. They must go up in equal steps, e.g. `20, 24, 28, 32`.",
      "Copy the matching **y values** in the same order.",
      "Type the x where you want to estimate y. Bessel works best when it is about halfway between two middle x values.",
      "Press {button}. You get the difference table, the value of p and each term of Bessel's formula.",
    ],
  },
  stirling: {
    howTo: [
      "Copy the **x values** of your table, separated by commas. They must go up in equal steps.",
      "Copy the matching **y values** in the same order.",
      "Type the x where you want to estimate y. Stirling works best when it is close to a middle x value.",
      "Press {button}. You get the difference table, p and each term of Stirling's formula.",
    ],
  },
  'difference-table': {
    howTo: [
      "Copy the **x values**, separated by commas, going up in equal steps: `1, 2, 3, 4, 5`.",
      "Copy the matching **y values** in the same order.",
      "Choose how the table is labelled (forward Δ, backward ∇ or central δ); the numbers are the same.",
      "Press {button} to see every column of differences.",
    ],
  },
  'chebyshev-nodes': {
    howTo: [
      "Type the function to interpolate, e.g. Runge's `1/(1 + 25x^2)`.",
      "Type the interval a to b and how many points (nodes) to use.",
      "Press {button}. NETZ compares equally spaced points with Chebyshev points, so you can see Chebyshev's smaller error.",
    ],
    help: {
      f: "The function to approximate, in x: `1/(1 + 25x^2)`.",
      a: "Left end of the interval.",
      b: "Right end of the interval.",
      n: "How many interpolation points. 11 shows Runge's wiggles clearly.",
    },
    maths: ['f'],
  },
  'everett-interpolation': {
    howTo: [
      "Copy the **x values** of your table, separated by spaces or commas, going up in equal steps: `20 24 28 32`.",
      "Copy the matching **y values** in the same order.",
      "Type the x where you want y; it should lie between two middle x values.",
      "Press {button} to see the central differences and each term of Everett's formula.",
    ],
    help: {
      x: "The x values from the table, equally spaced, smallest first.",
      y: "The y value for each x, in the same order.",
      at: "The x where you want to estimate y.",
    },
  },
  'hermite-interpolation': {
    howTo: [
      "Type the **points x** where you know the function, e.g. `0 1`.",
      "Type the **value f(x)** at each point, and the **slope f′(x)** at each point, in the same order.",
      "Optionally type an x where you want the curve's value.",
      "Press {button} to get the Hermite polynomial that matches both the values and the slopes.",
    ],
    help: {
      x: "The x values, separated by spaces or commas.",
      y: "The function's value at each x, same order.",
      dy: "The derivative (slope) at each x, same order.",
      at: "Optional: an x where you want the polynomial's value.",
    },
  },
  'inverse-interpolation': {
    howTo: [
      "Choose the method (Lagrange works for any spacing).",
      "Copy the **x values** and the **y values** of your table, in the same order.",
      "Type the y value you have; NETZ finds the x that gives it.",
      "Press {button} to see each step.",
    ],
    help: {
      method: "How to work backwards from y to x. Lagrange is the usual exam method.",
      x: "The x values from the table.",
      y: "The y value for each x, same order.",
      target: "The y you know. NETZ finds the x where the table reaches it.",
    },
  },
  'cubic-spline': {
    howTo: [
      "Copy the **x values** of your points, smallest first, separated by commas.",
      "Copy the matching **y values** in the same order.",
      "Choose the end condition (natural: the curve is straight at both ends) and, if you like, an x to evaluate.",
      "Press {button} to get each cubic piece and its working.",
    ],
  },
};

export default GUIDES;
