/**
 * Critical values for the hypothesis-test pages (t, chi-square, F), computed from the
 * distributions themselves so any degrees of freedom work, not only the ones in a printed table.
 */

// log Γ(x) by the Lanczos approximation (accurate to ~1e-14 for x > 0)
function logGamma(x) {
  const c = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = 0.99999999999980993;
  const t = x + 7.5;
  for (let i = 0; i < 8; i++) a += c[i] / (x + i + 1);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

// Continued fraction for the incomplete beta function (Numerical Recipes "betacf")
function betaContinuedFraction(a, b, x) {
  const tiny = 1e-300;
  let c = 1;
  let d = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-14) break;
  }
  return h;
}

// Regularized incomplete beta I_x(a, b)
function incompleteBeta(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2)
    ? (front * betaContinuedFraction(a, b, x)) / a
    : 1 - (front * betaContinuedFraction(b, a, 1 - x)) / b;
}

// Regularized lower incomplete gamma P(a, x)
function incompleteGamma(a, x) {
  if (x <= 0) return 0;
  const lead = Math.exp(-x + a * Math.log(x) - logGamma(a));
  if (x < a + 1) {
    let sum = 1 / a;
    let term = sum;
    for (let n = 1; n < 500; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-15) break;
    }
    return sum * lead;
  }
  // continued fraction for Q(a, x), then P = 1 - Q
  const tiny = 1e-300;
  let b = x + 1 - a;
  let c = 1 / tiny;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-15) break;
  }
  return 1 - lead * h;
}

// Upper-tail probabilities P(X > x)
const tUpper = (t, df) => 0.5 * incompleteBeta(df / (df + t * t), df / 2, 0.5);
const chiSquareUpper = (x, df) => 1 - incompleteGamma(df / 2, x / 2);
const fUpper = (f, df1, df2) => 1 - incompleteBeta((df1 * f) / (df1 * f + df2), df1 / 2, df2 / 2);

// Solves upperTail(x) = p for x > 0 by bisection (upperTail decreases as x grows)
function upperQuantile(upperTail, p) {
  let lo = 0;
  let hi = 1;
  while (upperTail(hi) > p) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (upperTail(mid) > p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const round3 = (v) => Math.round(v * 1000) / 1000;

/** Two-tailed critical t: |t| beyond this rejects H0 at level alpha (e.g. df 7, 5% → 2.365). */
export function tCritical(df, alpha = 0.05) {
  return round3(upperQuantile((t) => tUpper(t, df), alpha / 2));
}

/** Upper-tail critical chi-square (e.g. df 3, 5% → 7.815). */
export function chiSquareCritical(df, alpha = 0.05) {
  return round3(upperQuantile((x) => chiSquareUpper(x, df), alpha));
}

/** Upper-tail critical F for (df1, df2) (e.g. (4, 5), 5% → 5.192). */
export function fCritical(df1, df2, alpha = 0.05) {
  return round3(upperQuantile((f) => fUpper(f, df1, df2), alpha));
}
