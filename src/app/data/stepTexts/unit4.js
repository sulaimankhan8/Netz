// Plain-words sentences for the Unit 4 calculators' working steps (see src/app/components/method/calcGuide.js, withStepText).
// id: { 'Step title (or its start)': 'One sentence: what this step does and why.' }
const TEXTS = {
  cholesky: {
    'Check A is symmetric': 'Cholesky only works for a symmetric matrix (aᵢⱼ = aⱼᵢ) that is positive definite, so this is checked first.',
    'Work out L column by column': 'Each diagonal entry is a square root of what is left of aⱼⱼ; each entry below it is what is left of aᵢⱼ divided by that diagonal entry.',
    'The factor L': 'L is lower triangular and L times its transpose gives back A.',
    'Forward substitution': 'Solve L y = b from the top row down: each row has one new unknown.',
    'Back substitution': 'Solve Lᵀ x = y from the bottom row up to get the answer x.',
  },
  qr: {
    'Gram–Schmidt on the columns of A': 'Take the columns of A one at a time, remove the parts along the q’s already found, and divide by the length: this gives perpendicular unit vectors q.',
    'R from the dot products': 'R holds the numbers used on the way: the dot products qⱼ·aₖ above the diagonal and the lengths |uₖ| on it.',
    'Check': 'Multiplying Q by R must give A back, and QᵀQ must be the identity.',
    'The QR algorithm': 'Split Aₖ = QₖRₖ, then multiply the other way round, Aₖ₊₁ = RₖQₖ; this keeps the eigenvalues and pushes the entries below the diagonal to 0.',
    'Converged': 'The diagonal now holds the eigenvalues.',
    'Did not fully converge': 'The entries below the diagonal are not yet small; the diagonal gives approximate eigenvalues.',
  },
  'jacobi-eigen': {
    'Rotation 1': 'Pick the largest off-diagonal entry and rotate by the angle θ that makes it zero; the eigenvalues do not change.',
    'Converged': 'All off-diagonal entries are now (nearly) zero, so the diagonal entries are the eigenvalues; the product of the rotations gives the eigenvectors.',
    'Stopped after': 'The off-diagonal entries did not all reach zero in the allowed rotations; the diagonal is an approximation.',
  },
  'conjugate-gradient': {
    'Start': 'The residual r₀ = b − Ax₀ measures how far the guess is from solving the system; the first search direction is the residual itself.',
    'Step 1 in full': 'Move along the search direction by the step α that makes the error smallest, update the residual, then build the next direction from it (β makes it conjugate to the last one).',
    'Step': 'The same update with the new direction: α, the new x, the new residual and β.',
    'Solution': 'In exact arithmetic the method finishes in at most n steps; substituting x back checks that Ax = b.',
  },
  'finite-difference-bvp': {
    'Replace the derivatives': 'Split [a, b] into n equal steps and replace y″ and y′ by difference formulas, so the differential equation becomes an ordinary equation at each grid point.',
    'The equations at the inner points': 'Write that equation at every inner point with its numbers; the end values come from the boundary conditions.',
    'Solve the tridiagonal system': 'Each equation links only a point and its two neighbours, so the system is tridiagonal and the Thomas algorithm solves it quickly.',
  },
  'shooting-method': {
    'Turn it into an initial value problem': 'Guess the missing starting slope y′(a) and solve forward with RK4, as if it were an initial value problem.',
    'Secant method on the slope': 'Each guess gives a value y(b); the secant method adjusts the slope until y(b) hits the required boundary value.',
    'Result': 'The slope that hits the target; the table is the solution with that slope.',
  },
  'heat-equation': {
    'Grid': 'Choose the step h in x and k in t; λ = c²k/h² decides the scheme’s weights (and, for the explicit scheme, its stability).',
    'Bender–Schmidt': 'With λ = ½ each new value is simply the average of its two neighbours one time step earlier: work across each row in turn.',
    'Crank–Nicolson': 'Each new time level comes from an equation at every inner point that links three unknown neighbours, so a small tridiagonal system is solved per row.',
  },
  'wave-equation': {
    'Grid': 'Choose h and k; r = ck/h must be at most 1 for the explicit scheme to stay stable.',
    'First time step': 'The first row uses the starting shape f and starting velocity g, because there is no earlier row yet.',
    'Later steps': 'Every later value comes from the row before it (the neighbours) and the row two steps back.',
  },
  'laplace-liebmann': {
    'Five-point formula': 'At every inner point, u is the average of its four neighbours (up, down, left, right); start the unknowns at the average boundary value.',
    'Sweep 1 in full': 'Go through the inner points in order and replace each by the average of its neighbours, using new values as soon as they are found.',
    'Liebmann': 'Keep sweeping until no value changes by more than the tolerance; the table shows every sweep.',
  },
};

export default TEXTS;
