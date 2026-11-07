/**
 * Modular arithmetic: the maths for /modular-arithmetic (Unit 15).
 *   gcd        Euclid's algorithm, with the division table
 *   bezout     extended Euclid: gcd(a, b) = ax + by
 *   inverse    a⁻¹ mod m (exists when gcd(a, m) = 1)
 *   power      aᵇ mod m by repeated squaring
 *   congruence ax ≡ b (mod m): all solutions
 *   rsa        a toy RSA: n = pq, φ = (p − 1)(q − 1), d = e⁻¹ mod φ, c = mᵉ mod n, m = cᵈ mod n
 * Whole numbers only; BigInt keeps powers exact.
 */
import { EngineError } from '../numeric/steps';

const int = (t, label) => { const s = String(t ?? '').trim(); if (!/^-?\d+$/.test(s)) throw new EngineError(`${label} must be a whole number.`); return BigInt(s); };
const absB = (x) => (x < 0n ? -x : x);
const mod = (a, m) => ((a % m) + m) % m;

function euclid(a, b) {
  const rows = [];
  let x = absB(a), y = absB(b);
  while (y !== 0n) { const q = x / y, r = x % y; rows.push({ a: String(x), b: String(y), q: String(q), r: String(r) }); [x, y] = [y, r]; }
  return { g: x, rows };
}
function extended(a, b) {
  let [r0, r1, s0, s1, t0, t1] = [a, b, 1n, 0n, 0n, 1n];
  const rows = [{ q: '', r: String(r0), s: '1', t: '0' }, { q: '', r: String(r1), s: '0', t: '1' }];
  while (r1 !== 0n) {
    const q = r0 / r1;
    [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; [t0, t1] = [t1, t0 - q * t1];
    rows.push({ q: String(q), r: String(r1), s: String(s1), t: String(t1) });
  }
  return { g: r0, x: s0, y: t0, rows };
}
function powMod(a, b, m) {
  const rows = [];
  let result = 1n, base = mod(a, m), e = b;
  while (e > 0n) {
    const bit = e & 1n;
    if (bit) result = (result * base) % m;
    rows.push({ bit: String(bit), base: String(base), result: String(result) });
    base = (base * base) % m; e >>= 1n;
  }
  return { value: result, rows };
}

export function solve({ mode = 'gcd', a = '', b = '', m = '', p = '', q = '', e = '', msg = '' }) {
  const steps = [];
  if (mode === 'gcd' || mode === 'bezout') {
    const A = int(a, 'a'), Bv = int(b, 'b');
    if (A === 0n && Bv === 0n) throw new EngineError('gcd(0, 0) is not defined.');
    if (mode === 'gcd') {
      const r = euclid(A, Bv);
      steps.push({ title: "Euclid's algorithm", formula: 'a = qb + r, \\ \\gcd(a, b) = \\gcd(b, r)', depth: 0, lines: r.rows.slice(0, 12).map((x) => `${x.a} = ${x.q} \\times ${x.b} + ${x.r}`) });
      return { mode, answer: `\\gcd(${A}, ${Bv}) = ${r.g}`, columns: [{ key: 'a', label: 'a' }, { key: 'b', label: 'b' }, { key: 'q', label: 'q' }, { key: 'r', label: 'r', highlight: true }], rows: r.rows, steps, notes: [`lcm(${A}, ${Bv}) = |ab|/gcd = ${r.g === 0n ? 0 : absB(A * Bv) / r.g}.`], verified: true };
    }
    const r = extended(A, Bv);
    steps.push({ title: 'Extended Euclid', formula: 'r_{k+1} = r_{k-1} - q_kr_k, \\ \\text{same for } s, t', depth: 0, lines: [`\\gcd = ${r.g} = (${r.x})(${A}) + (${r.y})(${Bv})`] });
    return { mode, answer: `${r.g} = (${r.x})(${A}) + (${r.y})(${Bv})`, columns: [{ key: 'q', label: 'q' }, { key: 'r', label: 'r', highlight: true }, { key: 's', label: 's' }, { key: 't', label: 't' }], rows: r.rows, steps, notes: ['Bézout: the gcd is always a combination of a and b with whole-number coefficients.'], verified: r.x * A + r.y * Bv === r.g };
  }
  if (mode === 'inverse') {
    const A = int(a, 'a'), M = int(m, 'm');
    if (M < 2n) throw new EngineError('The modulus must be at least 2.');
    const r = extended(mod(A, M), M);
    if (r.g !== 1n) throw new EngineError(`gcd(${A}, ${M}) = ${r.g} ≠ 1, so ${A} has no inverse mod ${M}.`);
    const inv = mod(r.x, M);
    steps.push({ title: 'Extended Euclid', depth: 0, lines: [`1 = (${r.x})(${mod(A, M)}) + (${r.y})(${M})`, `\\Rightarrow ${A}^{-1} \\equiv ${r.x} \\equiv ${inv} \\pmod{${M}}`] });
    steps.push({ title: 'Check', depth: 0, lines: [`${A} \\times ${inv} = ${A * inv} \\equiv ${mod(A * inv, M)} \\pmod{${M}}`] });
    return { mode, answer: `${A}^{-1} \\equiv ${inv} \\pmod{${M}}`, columns: [{ key: 'q', label: 'q' }, { key: 'r', label: 'r', highlight: true }, { key: 's', label: 's' }, { key: 't', label: 't' }], rows: r.rows, steps, notes: [], verified: mod(A * inv, M) === 1n };
  }
  if (mode === 'power') {
    const A = int(a, 'a'), Bv = int(b, 'The exponent'), M = int(m, 'm');
    if (Bv < 0n) throw new EngineError('Use a non-negative exponent.');
    if (M < 1n) throw new EngineError('The modulus must be positive.');
    const r = powMod(A, Bv, M);
    steps.push({ title: 'Square and multiply', formula: '\\text{read the exponent in binary, from the right}', depth: 0, lines: [`${Bv} = ${Bv.toString(2)}_2`, `${A}^{${Bv}} \\equiv ${r.value} \\pmod{${M}}`] });
    return { mode, answer: `${A}^{${Bv}} \\equiv ${r.value} \\pmod{${M}}`, columns: [{ key: 'bit', label: 'bit' }, { key: 'base', label: 'a^(2^k) mod m' }, { key: 'result', label: 'result', highlight: true }], rows: r.rows, steps, notes: ['Each step squares the base; the result is multiplied in when the bit is 1.'], verified: true };
  }
  if (mode === 'congruence') {
    const A = int(a, 'a'), Bv = int(b, 'b'), M = int(m, 'm');
    if (M < 2n) throw new EngineError('The modulus must be at least 2.');
    const r = extended(mod(A, M), M);
    const g = r.g;
    if (mod(Bv, g) !== 0n) throw new EngineError(`gcd(${A}, ${M}) = ${g} does not divide ${Bv}, so ${A}x ≡ ${Bv} (mod ${M}) has no solution.`);
    const m2 = M / g;
    const x0 = mod((Bv / g) * r.x, m2);
    const sols = Array.from({ length: Number(g < 20n ? g : 20n) }, (_, k) => x0 + BigInt(k) * m2);
    steps.push({ title: 'Divide by the gcd', depth: 0, lines: [`d = \\gcd(${A}, ${M}) = ${g}, \\ d \\mid ${Bv} \\Rightarrow ${g} \\text{ solution${g > 1n ? 's' : ''} mod } ${M}`] });
    steps.push({ title: 'Solve', depth: 0, lines: [`x \\equiv ${x0} \\pmod{${m2}}`, `x = ${sols.join(', ')}${g > 20n ? ', \\ldots' : ''} \\pmod{${M}}`] });
    return { mode, answer: `x \\equiv ${x0} \\pmod{${m2}}`, columns: [{ key: 'q', label: 'q' }, { key: 'r', label: 'r', highlight: true }, { key: 's', label: 's' }, { key: 't', label: 't' }], rows: r.rows, steps, notes: [], verified: true };
  }
  if (mode === 'rsa') {
    const P = int(p, 'p'), Q = int(q, 'q'), E = int(e, 'e'), Mm = int(msg, 'The message');
    const isPrime = (x) => { if (x < 2n) return false; for (let d = 2n; d * d <= x; d++) if (x % d === 0n) return false; return true; };
    if (!isPrime(P) || !isPrime(Q) || P === Q) throw new EngineError('p and q must be two different primes.');
    const N = P * Q, phi = (P - 1n) * (Q - 1n);
    const r = extended(mod(E, phi), phi);
    if (r.g !== 1n) throw new EngineError(`e must have no common factor with φ = ${phi} (gcd is ${r.g}).`);
    if (Mm < 0n || Mm >= N) throw new EngineError(`The message must be a number from 0 to n − 1 = ${N - 1n}.`);
    const d = mod(r.x, phi);
    const c = powMod(Mm, E, N).value, back = powMod(c, d, N).value;
    steps.push(
      { title: 'Keys', formula: 'n = pq, \\ \\varphi = (p-1)(q-1), \\ d = e^{-1} \\bmod \\varphi', depth: 0, lines: [`n = ${P} \\times ${Q} = ${N}, \\quad \\varphi = ${P - 1n} \\times ${Q - 1n} = ${phi}, \\quad d = ${E}^{-1} \\bmod ${phi} = ${d}`] },
      { title: 'Encrypt', formula: 'c = m^e \\bmod n', depth: 0, lines: [`c = ${Mm}^{${E}} \\bmod ${N} = ${c}`] },
      { title: 'Decrypt', formula: 'm = c^d \\bmod n', depth: 0, lines: [`m = ${c}^{${d}} \\bmod ${N} = ${back}`] },
    );
    return { mode, answer: `\\text{public } (n, e) = (${N}, ${E}), \\ \\text{private } d = ${d}, \\quad ${Mm} \\to ${c} \\to ${back}`, columns: [], rows: [], steps, notes: ['Real RSA uses primes hundreds of digits long; this toy version shows the same steps.'], verified: back === Mm };
  }
  throw new EngineError('Choose what to work out.');
}
