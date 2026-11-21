// Guide mode words for the Unit 8 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const GRID = "Type each number in its box. Fractions like `1/2` and negative numbers are fine. Use **Paste** to copy a whole matrix in.";
const square = (what) => [
  "Choose the size of the matrix (2×2, 3×3 …) from the size menu.",
  "Type each number of the matrix in its box, row by row.",
  `Press {button} ${what}`,
];

const GUIDES = {
  determinant: { howTo: square('to see the expansion (or row reduction) and the value.'), help: { matrix: GRID } },
  'matrix-inverse': { howTo: square('to get A⁻¹ by the adjoint or Gauss-Jordan method. A matrix with determinant 0 has no inverse.'), help: { matrix: GRID } },
  rank: { howTo: square('to row-reduce to echelon form and count the non-zero rows.'), help: { matrix: GRID } },
  'matrix-calculator': {
    howTo: [
      "Choose the operation: add, subtract, multiply, transpose, power …",
      "Choose the sizes and type the numbers of A (and B). For A × B, the columns of A must match the rows of B.",
      "Press {button}.",
    ],
    help: { matrix: GRID },
  },
  eigenvalues: { howTo: square('for the characteristic equation, each eigenvalue and its eigenvector.'), help: { matrix: GRID } },
  'cayley-hamilton': { howTo: square('to verify A satisfies its own characteristic equation and to find A⁻¹ from it.'), help: { matrix: GRID } },
  diagonalization: {
    howTo: [...square('for P and D with A = P D P⁻¹.').slice(0, 2), "Optionally type k to also get Aᵏ, then press {button}."],
    help: { matrix: GRID, power: "Optional: a whole number k, to find Aᵏ = P Dᵏ P⁻¹." },
  },
  consistency: {
    howTo: [
      "Write the equations with the unknowns in the same order.",
      "Type the **augmented matrix**: each row is one equation, the numbers in front of the unknowns first and the number after = in the last column.",
      "Press {button}. NETZ compares the ranks to say: one solution, none, or infinitely many.",
    ],
    help: { matrix: "One row per equation. The last column is the right-hand side." },
  },
  'linear-dependence': {
    howTo: ["Type one vector per row.", "Press {button}. If the rank is less than the number of vectors, they are dependent, and NETZ gives the relation."],
    help: { matrix: "Each row is one vector, e.g. (1, 2, 3) in the first row." },
  },
  'linear-transformations': {
    howTo: ["Choose how T is given: a formula or a matrix.", "Type it, e.g. `T(x, y, z) = (x + y, y - z)`.", "Press {button} for the matrix, kernel, range, rank and nullity."],
    help: { mode: "By formula or by matrix.", formula: "T with its letters and the output in brackets.", A: "Rows separated by `;`, numbers by spaces: `1 2 3; 2 4 6`." },
  },
  'quadratic-form': {
    howTo: ["Type the quadratic form, e.g. `3x^2 + 5y^2 - 2xy`. Every term must have degree 2.", "Press {button} for its matrix, the canonical form, rank, index and nature."],
    help: { form: "Write xy for x·y." },
    maths: ['form'],
  },
  'svd-calculator': {
    howTo: ["Type A row by row: numbers separated by spaces, `;` between rows: `3 2 2; 2 3 -2`.", "Press {button} for U, Σ and Vᵀ."],
    help: { A: "Any size. Rows separated by `;`." },
  },
  vectors: {
    howTo: ["Choose what to find: dot product, cross product, angle, projection, triple product …", "Type the vectors as `2i - j + 3k` or `(2, -1, 3)`.", "Press {button}."],
    help: { op: "Which vector operation.", a: "The first vector.", b: "The second vector.", c: "The third vector (for triple products)." },
  },
};

export default GUIDES;
