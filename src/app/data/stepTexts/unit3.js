// Plain-words sentences for the Unit 3 calculators' working steps (see src/app/components/method/calcGuide.js, withStepText).
// id: { 'Step title (or its start)': 'One sentence: what this step does and why.' }
const TEXTS = {
  'double-integration': {
    'Step sizes': 'Split the rectangle into a grid: h is the step in x and k the step in y.',
    'Weights in each direction': 'Each direction uses the one-dimensional rule’s weights; a grid point’s weight is its x-weight times its y-weight.',
    'Trapezoidal rule in both directions': 'Add up every grid value times its weight, then multiply by the factor hk/4.',
    "Simpson's rule in both directions": 'Add up every grid value times its weight (1, 4, 2, 4, …, 1 in each direction), then multiply by hk/9.',
    'Check': 'A very fine grid gives the reference value, so you can see how close this grid is.',
  },
  'monte-carlo-integration': {
    'Sample mean': 'Pick N random x values in [a, b], average f over them, and multiply by the width b − a. The standard error says how much the estimate would vary with other random numbers.',
    'Hit or miss': 'Throw N random points into the box around the curve and count the fraction that land under it; that fraction times the box area estimates the integral.',
    'Compare': 'The exact value (where known) shows the actual error; it shrinks roughly like 1/√N.',
  },
};

export default TEXTS;
