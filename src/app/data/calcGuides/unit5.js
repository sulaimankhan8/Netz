// Guide mode words for the Unit 5 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const PROB = "A probability between 0 and 1. Decimals or fractions: `0.3`, `1/6`.";

const GUIDES = {
  anova: {
    howTo: [
      "Choose the design: **one-way** (compare several groups) or **two-way** (rows and columns).",
      "Type the data: one group's values separated by commas, then `;` before the next group: `8, 10, 7; 7, 5, 10; 12, 9, 13`.",
      "Choose the significance level (5% is usual) and press {button} for the ANOVA table and the decision.",
    ],
    help: {
      kind: "One-way: one factor (e.g. three teaching methods). Two-way: two factors, one per row and one per column.",
      groups: "Groups (or rows) separated by `;`, values inside a group by commas. Two-way needs the same count in every row.",
      alpha: "How sure you want to be. 5% (0.05) is the usual choice.",
    },
  },
  bayes: {
    howTo: [
      "List the possible causes (events E₁, E₂ …) and type how likely each is **before** you know the result: P(Eᵢ). They must add up to 1.",
      "Type how likely the observed result A is **under each cause**: P(A | Eᵢ), in the same order.",
      "Press {button} to get P(Eᵢ | A), the chance of each cause given what you saw.",
    ],
    help: {
      priors: "One probability per cause, separated by commas, adding to 1: `0.5, 0.3, 0.2`.",
      likelihoods: "For each cause, the chance of the observed result if that cause is true: `0.02, 0.03, 0.05`.",
      names: "Optional labels for the causes, e.g. `Machine A, Machine B, Machine C`.",
    },
  },
  binomial: {
    howTo: [
      "Choose what to find: P(X = a), P(X ≤ a), P(a ≤ X ≤ b) and so on.",
      "Type n, the number of trials (e.g. 10 coin tosses), and p, the chance of success in one trial.",
      "Type a (and b if needed) and press {button}.",
    ],
    help: {
      query: "Which probability you want, e.g. exactly a successes, or at most a.",
      a: "The number of successes (a whole number from 0 to n).",
      b: "The upper number of successes, for a range.",
      n: "How many times the experiment is repeated: a whole number.",
      p: PROB,
    },
  },
  'confidence-interval': {
    howTo: [
      "Choose what the interval is for: a mean, or a proportion.",
      "Type your sample's numbers: the mean and standard deviation (or the number of successes), and the sample size n.",
      "Type the confidence level, usually `95`, and press {button}.",
    ],
    help: {
      mode: "Mean: average of a measurement. Proportion: the share of a sample with some property.",
      xbar: "The sample mean x̄ (the average of your sample).",
      sd: "The standard deviation: σ if known, otherwise the sample's s.",
      x: "How many in the sample have the property, e.g. 120 out of 400.",
      n: "The sample size: how many items were measured.",
      level: "How confident, in percent: `90`, `95` or `99`.",
    },
  },
  'control-charts': {
    howTo: [
      "Choose the chart: x̄–R for measurements in subgroups, p or np for defectives, c for defects.",
      "Type the data: for x̄–R, one subgroup per row with `;` between rows: `10 12 11; 11 13 12`.",
      "Press {button} for the centre line, control limits and any points out of control.",
    ],
    help: {
      chart: "Which control chart. x̄–R needs measurements; p, np and c need counts.",
      data: "Subgroups separated by `;`, values inside a subgroup by spaces. For p and c charts, one count per sample.",
      n: "The size of each sample (for p and np charts).",
    },
  },
  correlation: {
    howTo: [
      "Choose **Pearson** (straight-line relationship) or **Spearman** (ranks).",
      "Type the x values and the y values in the same order: the 1st x goes with the 1st y.",
      "Press {button} for r and the working table.",
    ],
    help: {
      method: "Pearson uses the numbers themselves; Spearman uses their ranks.",
      x: "The first variable, separated by commas: `1, 2, 3, 4, 5`.",
      y: "The second variable, same count and order: `2, 4, 5, 4, 5`.",
    },
  },
  'curve-fitting': {
    howTo: [
      "Choose the kind of curve: exponential y = a·eᵇˣ, power y = a·xᵇ, or a polynomial.",
      "Type the x values and the y values in the same order.",
      "Press {button}. NETZ fits the curve by least squares and shows the normal equations.",
    ],
    help: {
      model: "The shape of curve to fit. Exponential and power fits need positive y values.",
      x: "The x values, separated by commas.",
      y: "The y value for each x, same order.",
      degree: "For a polynomial: 2 fits a parabola, 3 a cubic.",
      at: "Optional: an x where you want the fitted curve's value.",
    },
  },
  'descriptive-statistics': {
    howTo: [
      "Choose your data type: a plain **list**, values with **frequencies**, or **class intervals** (like 0-10).",
      "Type the data. Values are separated by commas.",
      "Press {button} for the mean, median, mode, standard deviation and the working table.",
    ],
    help: {
      mode: "List: raw numbers. Frequency: each value and how often it occurs. Classes: grouped data like 0-10, 10-20.",
      data: "Your numbers, separated by commas: `12, 15, 11, 18`.",
      x: "Each different value, separated by commas.",
      classes: "Class intervals separated by commas: `0-10, 10-20, 20-30`.",
      f: "How many times each value (or class) occurs, same order.",
    },
  },
  'exponential-dist': {
    howTo: [
      "Choose what to find, e.g. P(X ≤ x) or P(a < X < b).",
      "Type the rate λ (events per unit time). The mean waiting time is 1/λ.",
      "Type x (or a and b) and press {button}.",
    ],
    help: {
      mode: "Which probability you want.",
      lambda: "The rate λ. If your question gives the mean m, λ = 1/m.",
      x: "The value of X.",
      a: "Lower value.",
      b: "Upper value.",
    },
  },
  'gamma-dist': {
    howTo: [
      "Choose what to find.",
      "Type the shape α and the scale θ. If your book gives a rate β, use θ = 1/β.",
      "Type x (or a and b) and press {button}.",
    ],
    help: {
      mode: "Which probability you want.",
      alpha: "The shape α (often a whole number of events).",
      theta: "The scale θ. The mean is α·θ.",
      x: "The value of X.",
      a: "Lower value.",
      b: "Upper value.",
    },
  },
  'geometric-dist': {
    howTo: [
      "Choose what to find, e.g. P(X = k).",
      "Type p, the chance of success in one trial. X counts the trials up to and including the first success.",
      "Press {button}.",
    ],
    help: { mode: 'Which probability you want.', p: PROB },
  },
  'joint-distribution': {
    howTo: [
      "Type the values X can take (one per row of your table) and the values Y can take (one per column).",
      "Type the table of probabilities: one row per x value, numbers separated by commas, `;` between rows.",
      "Press {button} for the marginal distributions, means, covariance and correlation.",
    ],
    help: {
      xs: "The values of X, separated by commas: `0, 1, 2`.",
      ys: "The values of Y, separated by commas: `0, 1`.",
      table: "P(X = x, Y = y): one row per x, `;` between rows: `1/8, 1/8; 1/4, 1/4; 1/8, 1/8`. Must add up to 1.",
    },
  },
  'markov-chain': {
    howTo: [
      "Type the transition matrix P row by row: numbers separated by spaces, `;` between rows. Each row adds up to 1.",
      "Optionally type where the chain starts, e.g. `1 0` (surely in state 1).",
      "Type how many steps n and press {button} for Pⁿ, the distribution after n steps and the long-run (steady) state.",
    ],
    help: {
      P: "Row i lists the chances of moving from state i to each state: `0.7 0.3; 0.4 0.6`.",
      start: "Optional: the starting chances of each state, adding to 1.",
      n: "How many steps to move forward.",
    },
  },
  mgf: {
    howTo: [
      "Choose the distribution.",
      "Type its numbers (for example p for binomial, λ for Poisson, μ and σ for normal).",
      "Press {button} for M(t) and the mean and variance found from its derivatives.",
    ],
    help: {
      dist: "Which distribution's moment generating function you want.",
      p: PROB,
      lambda: "The rate or mean λ.",
      mu: "The mean μ.",
      sigma: "The standard deviation σ.",
      alpha: "The shape α.",
      theta: "The scale θ.",
      xs: "For your own distribution: the values X can take.",
      ps: "The probability of each value, same order, adding to 1.",
    },
  },
  'non-parametric-tests': {
    howTo: [
      "Choose the test: sign test, Wilcoxon or Mann–Whitney.",
      "Type the sample (and the second sample if the test needs one), numbers separated by spaces.",
      "Type the median to test against (one-sample tests) and the level α, then press {button}.",
    ],
    help: {
      test: "Sign and Wilcoxon: one sample or paired data. Mann–Whitney: two independent samples.",
      x: "The first sample's values.",
      y: "The second sample (for paired or two-sample tests).",
      m0: "The median you are testing against.",
      alpha: "The significance level, usually `0.05`.",
    },
  },
  normal: {
    howTo: [
      "Choose what to find: a probability like P(X < a), or the x for a given probability.",
      "Type the mean μ and standard deviation σ (for the standard normal Z: `0` and `1`).",
      "Type a (and b if needed) and press {button}. You see the z-scores and the shaded area.",
    ],
    help: {
      query: "Which probability (or which value) you want.",
      mu: "The mean μ: the centre of the bell curve.",
      sigma: "The standard deviation σ: how spread out it is. Must be positive.",
      a: "The value of X (or the lower value).",
      b: "The upper value, for a range.",
      p: "A probability between 0 and 1; NETZ finds the x with P(X < x) = p.",
    },
  },
  poisson: {
    howTo: [
      "Choose whether you know the mean λ, or n and p (for a binomial approximation).",
      "Type λ, the average number of events, and the counts you want the probability for.",
      "Press {button}.",
    ],
    help: {
      source: "Mean λ given directly, or found as λ = n·p.",
      lambda: "The average number of events in the interval, e.g. 3 calls a minute.",
      p: PROB,
    },
  },
  'random-variables': {
    howTo: [
      "Choose **discrete** (a list of values) or **continuous** (a density f(x)).",
      "Discrete: type the values and the probability of each. Continuous: type f(x) and the range a to b.",
      "Press {button} for the mean, variance and any probability you asked for.",
    ],
    help: {
      kind: "Discrete: X takes separate values like 0, 1, 2. Continuous: X can be any number in a range.",
      x: "The values X can take, separated by commas.",
      p: "The probability of each value, same order, adding to 1. Fractions are fine.",
      f: "The density function in x, e.g. `2x`.",
      a: "Where the density starts.",
      b: "Where it ends.",
      c: "Optional: lower end of a probability P(c < X < d).",
      d: "Optional: upper end.",
    },
    maths: ['f'],
  },
  regression: {
    howTo: [
      "Type the x values and the y values in the same order.",
      "Optionally type an x to estimate y (or a y to estimate x).",
      "Press {button} for both regression lines, y on x and x on y, with the working table.",
    ],
    help: {
      x: "The x values, separated by commas.",
      y: "The y value for each x, same order.",
      atX: "Optional: an x where you want the predicted y.",
      atY: "Optional: a y where you want the predicted x.",
    },
  },
  'uniform-dist': {
    howTo: [
      "Type the lowest value a and the highest value b. X is equally likely anywhere between them.",
      "Type c and d to find P(c < X < d).",
      "Press {button}.",
    ],
    help: {
      a: "The smallest value X can take.",
      b: "The largest value X can take.",
      c: "Lower end of the probability you want.",
      d: "Upper end.",
    },
  },
};

export default GUIDES;
