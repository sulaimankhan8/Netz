/**
 * Related rates: the maths for /related-rates (catalog 6C). Word problems are given as templates with editable
 * numbers (plan decision D7): a relation between the quantities, differentiated with respect to time t, then the
 * known values put in. Each template writes its own steps the way a textbook would.
 */
import { EngineError } from '../numeric/steps';
import { exactTex } from '../symbolic/multi';

const r = (v) => exactTex(v);
const N = (v, label) => { const x = Number(String(v).trim()); if (!Number.isFinite(x)) throw new EngineError(`${label} must be a number.`); return x; };
const pos = (v, label) => { const x = N(v, label); if (!(x > 0)) throw new EngineError(`${label} must be positive.`); return x; };

export const TEMPLATES = {
  ladder: {
    title: 'A ladder slides down a wall',
    fields: [['L', 'Ladder length (m)', '10'], ['rate', 'Foot moves away at (m/s)', '2'], ['x', 'When the foot is this far out (m)', '6']],
    solve: (v) => {
      const L = pos(v.L, 'The length'), dx = N(v.rate, 'The rate'), x = pos(v.x, 'The distance');
      if (x >= L) throw new EngineError('The foot must be closer to the wall than the ladder is long.');
      const y = Math.sqrt(L * L - x * x), dy = (-x * dx) / y;
      return {
        lines: [['The relation', `x^2 + y^2 = ${r(L * L)} \\ (\\text{Pythagoras})`], ['Differentiate with respect to t', '2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0 \\Rightarrow \\frac{dy}{dt} = -\\frac{x}{y}\\frac{dx}{dt}'],
          ['Put in the values', `x = ${r(x)}, \\ y = \\sqrt{${r(L * L)} - ${r(x * x)}} = ${r(y)}, \\ \\frac{dx}{dt} = ${r(dx)}`], ['Answer', `\\frac{dy}{dt} = -\\frac{${r(x)}}{${r(y)}}(${r(dx)}) = ${r(dy)} \\text{ m/s}`]],
        answer: `\\frac{dy}{dt} = ${r(dy)} \\text{ m/s}`, note: dy < 0 ? `The top slides down at ${r(-dy).replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')} m/s.` : '',
      };
    },
  },
  cone: {
    title: 'Water flows into a cone (vertex down)',
    fields: [['H', 'Cone height (m)', '10'], ['R', 'Top radius (m)', '5'], ['Q', 'Water flows in at (m³/min)', '3'], ['h', 'When the depth is (m)', '4']],
    solve: (v) => {
      const H = pos(v.H, 'The height'), R = pos(v.R, 'The radius'), Q = N(v.Q, 'The rate'), h = pos(v.h, 'The depth');
      const k = R / H;
      const dh = Q / (Math.PI * k * k * h * h);
      return {
        lines: [['Similar triangles', `\\frac{r}{h} = \\frac{${r(R)}}{${r(H)}} \\Rightarrow r = ${r(k)}h`], ['Volume of water', `V = \\frac{1}{3}\\pi r^2 h = \\frac{\\pi}{3}(${r(k)}h)^2 h = ${r((k * k) / 3)}\\pi h^3`],
          ['Differentiate with respect to t', `\\frac{dV}{dt} = ${r(k * k)}\\pi h^2\\frac{dh}{dt}`], ['Answer', `\\frac{dh}{dt} = \\frac{${r(Q)}}{${r(k * k)}\\pi(${r(h)})^2} = ${r(Q / (k * k * h * h))}\\cdot\\frac{1}{\\pi} \\approx ${r(Number(dh.toPrecision(6)))} \\text{ m/min}`]],
        answer: `\\frac{dh}{dt} = \\frac{${r(Q / (k * k * h * h))}}{\\pi} \\approx ${Number(dh.toPrecision(6))} \\text{ m/min}`,
      };
    },
  },
  balloon: {
    title: 'A spherical balloon is inflated',
    fields: [['Q', 'Volume grows at (cm³/s)', '100'], ['radius', 'When the radius is (cm)', '5']],
    solve: (v) => {
      const Q = N(v.Q, 'The rate'), a = pos(v.radius, 'The radius');
      const dr = Q / (4 * Math.PI * a * a);
      return {
        lines: [['The relation', 'V = \\frac{4}{3}\\pi r^3'], ['Differentiate', '\\frac{dV}{dt} = 4\\pi r^2\\frac{dr}{dt}'], ['Answer', `\\frac{dr}{dt} = \\frac{${r(Q)}}{4\\pi(${r(a)})^2} = \\frac{${r(Q / (4 * a * a))}}{\\pi} \\approx ${Number(dr.toPrecision(6))} \\text{ cm/s}`]],
        answer: `\\frac{dr}{dt} = \\frac{${r(Q / (4 * a * a))}}{\\pi} \\approx ${Number(dr.toPrecision(6))} \\text{ cm/s}`,
      };
    },
  },
  ripple: {
    title: 'A circular ripple (or oil spill) spreads',
    fields: [['v', 'Radius grows at (cm/s)', '3'], ['radius', 'When the radius is (cm)', '10']],
    solve: (v) => {
      const s = N(v.v, 'The rate'), a = pos(v.radius, 'The radius');
      return {
        lines: [['The relation', 'A = \\pi r^2'], ['Differentiate', '\\frac{dA}{dt} = 2\\pi r\\frac{dr}{dt}'], ['Answer', `\\frac{dA}{dt} = 2\\pi(${r(a)})(${r(s)}) = ${r(2 * a * s)}\\pi \\text{ cm}^2\\text{/s}`]],
        answer: `\\frac{dA}{dt} = ${r(2 * a * s)}\\pi \\approx ${Number((2 * Math.PI * a * s).toPrecision(6))} \\text{ cm}^2\\text{/s}`,
      };
    },
  },
  shadow: {
    title: 'A person walks away from a lamp post',
    fields: [['H', 'Lamp height (m)', '6'], ['h', 'Person\'s height (m)', '2'], ['v', 'Walking speed (m/s)', '1.5']],
    solve: (v) => {
      const H = pos(v.H, 'The lamp height'), h = pos(v.h, 'The height'), s = N(v.v, 'The speed');
      if (h >= H) throw new EngineError('The lamp must be taller than the person.');
      const k = h / (H - h);
      return {
        lines: [['Similar triangles', `\\frac{s}{${r(h)}} = \\frac{x + s}{${r(H)}} \\Rightarrow s = ${r(k)}x \\ (x = \\text{distance from the post}, \\ s = \\text{shadow})`],
          ['Differentiate', `\\frac{ds}{dt} = ${r(k)}\\frac{dx}{dt} = ${r(k)}(${r(s)}) = ${r(k * s)}`], ['The tip of the shadow', `\\frac{d(x + s)}{dt} = ${r(s)} + ${r(k * s)} = ${r(s + k * s)}`]],
        answer: `\\text{shadow grows at } ${r(k * s)} \\text{ m/s; its tip moves at } ${r(s + k * s)} \\text{ m/s}`,
      };
    },
  },
  cars: {
    title: 'Two cars leave a crossroads at right angles',
    fields: [['va', 'Car A speed (km/h)', '60'], ['vb', 'Car B speed (km/h)', '80'], ['a', 'Car A distance from the crossroads (km)', '30'], ['b', 'Car B distance (km)', '40']],
    solve: (v) => {
      const va = N(v.va, 'Speed A'), vb = N(v.vb, 'Speed B'), a = pos(v.a, 'Distance A'), b = pos(v.b, 'Distance B');
      const z = Math.hypot(a, b), dz = (a * va + b * vb) / z;
      return {
        lines: [['The relation', 'z^2 = a^2 + b^2'], ['Differentiate', '2z\\frac{dz}{dt} = 2a\\frac{da}{dt} + 2b\\frac{db}{dt}'],
          ['Put in the values', `z = \\sqrt{${r(a * a)} + ${r(b * b)}} = ${r(z)}`], ['Answer', `\\frac{dz}{dt} = \\frac{(${r(a)})(${r(va)}) + (${r(b)})(${r(vb)})}{${r(z)}} = ${r(dz)} \\text{ km/h}`]],
        answer: `\\frac{dz}{dt} = ${r(dz)} \\text{ km/h}`,
      };
    },
  },
};

export function solve(v) {
  const T = TEMPLATES[v.template];
  if (!T) throw new EngineError('Choose a problem.');
  const out = T.solve(v);
  return { title: T.title, answer: out.answer, steps: out.lines.map(([title, line]) => ({ title, lines: [line], depth: 0 })), notes: out.note ? [out.note] : [], verified: true };
}
