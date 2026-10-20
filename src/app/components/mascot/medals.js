'use client';

import { STREAK_MEDALS } from '@/app/utils/progress/catalog';
import { TASK_EMBLEMS } from './taskEmblems';

/**
 * Every NETZ medal (NETZ_MEDALS_CATALOG.md), in the bg1 sunset palette:
 * - task: a hexagon in its group's colour with a picture of the method (taskEmblems.js)
 * - onboarding: an amber coin with the robot, its screen showing the step
 * - streak: a shield in its tier's colour with a flame, the day count and 1–3 stars
 * - season: a navy coin with the month's picture; the year badge has laurels; Pro is a circuit coin
 * Medals not earned yet show the same picture in grey, so students can see what is coming.
 */

const HEX_OUTER = '60,4 108.5,32 108.5,88 60,116 11.5,88 11.5,32';
const HEX_INNER = '60,14 99.8,37 99.8,83 60,106 20.2,83 20.2,37';
const HEX_SHINE = '60,14 99.8,37 99.8,60 20.2,60 20.2,37';
const SHIELD_OUTER = 'M60 6 L104 21 V60 C104 88 85 108 60 122 C35 108 16 88 16 60 V21 Z';
const SHIELD_INNER = 'M60 15 L95 27 V60 C95 83 80 100 60 112 C40 100 25 83 25 60 V27 Z';
const FLAME = 'M60 26 C69 37 76 45 73 56 C71 64 66 68 60 68 C54 68 48 64 47 56 C46 49 51 42 55 38 C56 44 58 47 60 48 C62 40 59 33 60 26 Z';
const FLAME_CORE = 'M60 46 C64 51 66 55 64 60 C63 63 61 64 60 64 C58 64 56 63 56 60 C55 56 58 52 60 46 Z';

const LOCKED = { rim: 'var(--pf-lock-rim, #3A3A40)', fill: 'var(--pf-lock-fill, #26262A)', mark: 'var(--pf-lock-mark, #6B6B73)' };
const LOCKED_INK = { ink: LOCKED.mark, acc: LOCKED.mark, rim: LOCKED.rim, soft: LOCKED.mark };

export const STREAK_TIER_COLOURS = {
  coral: { rim: '#A63E48', fill: '#D55E64', flame: '#FBAE3D', ink: '#FFFFFF' },
  orange: { rim: '#C2632A', fill: '#F88F4A', flame: '#D55E64', ink: '#3A1A0A' },
  amber: { rim: '#C98318', fill: '#FBAE3D', flame: '#D55E64', ink: '#5A3A00' },
  cream: { rim: '#B9A9A2', fill: '#F4F0EA', flame: '#F88F4A', ink: '#4D345E' },
  plum: { rim: '#6C2C4E', fill: '#96456E', flame: '#FBAE3D', ink: '#FFFFFF' },
  purple: { rim: '#33213F', fill: '#5E3F75', flame: '#FBAE3D', ink: '#FFFFFF' },
  night: { rim: '#FBAE3D', fill: '#132034', flame: '#D55E64', ink: '#FBAE3D' },
};

// Line and accent colours for each task group's pictures, picked to read on the group's fill
const GROUP_INK = {
  unit1: { ink: '#FFFFFF', acc: '#FBAE3D', soft: '#FFFFFF' },
  unit2: { ink: '#4D345E', acc: '#D55E64', soft: '#FFFFFF' },
  unit3: { ink: '#FFFFFF', acc: '#FBAE3D', soft: '#FFFFFF' },
  unit4: { ink: '#F4F4F2', acc: '#F88F4A', soft: '#FFFFFF' },
  unit5: { ink: '#FFFFFF', acc: '#FBAE3D', soft: '#FFFFFF' },
  notes: { ink: '#4D345E', acc: '#D55E64', soft: '#FFFFFF' },
  playground: { ink: '#4D345E', acc: '#FFF4E0', soft: '#FFFFFF' },
  sharing: { ink: '#FFFFFF', acc: '#FBAE3D', soft: '#FFFFFF' },
};

/* ---------------- task hexagons ---------------- */

function TaskMedal({ id, earned, fill, rim }) {
  const group = id ? id.split('.')[0] : '';
  const Emblem = id ? TASK_EMBLEMS[id] : null;
  const colours = earned ? { ...(GROUP_INK[group] || GROUP_INK.unit1), rim } : LOCKED_INK;
  return (
    <>
      <polygon points={HEX_OUTER} fill={earned ? rim : LOCKED.rim} />
      <polygon points={HEX_INNER} fill={earned ? fill : LOCKED.fill} />
      {earned && <polygon points={HEX_SHINE} fill="#FFFFFF" opacity="0.1" />}
      {Emblem ? (
        <g transform="translate(60 60) scale(0.84) translate(-60 -60)" opacity={earned ? 1 : 0.85}>
          <Emblem {...colours} />
        </g>
      ) : (
        <circle cx="60" cy="60" r="14" fill={earned ? 'rgba(255,255,255,0.55)' : LOCKED.mark} />
      )}
    </>
  );
}

/* ---------------- onboarding: the robot powers up ---------------- */

const SCREEN_EMBLEMS = {
  'onboard.meet-robot': (c) => (
    <>
      <path d="M53.5 53 A9 9 0 1 0 66.5 53" stroke={c} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M60 47 V57" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  'onboard.first-solve': (c) => <path d="M62 45 L52 61 H60 L57 73 L69 55 H61 Z" fill={c} />,
  'onboard.first-note': (c) => (
    <>
      <path d="M51 46 H64 L70 52 V72 H51 Z" stroke={c} strokeWidth="3" fill="none" strokeLinejoin="round" />
      <path d="M55 58 H66 M55 64 H63" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  'onboard.first-ink': (c) => <path d="M46 66 C50 52 55 70 60 58 C64 49 68 68 74 54" stroke={c} strokeWidth="3.5" fill="none" strokeLinecap="round" />,
  'onboard.account': (c) => <path d="M50 68 H70 A7 7 0 0 0 69 54 A9 9 0 0 0 52 53 A7.5 7.5 0 0 0 50 68 Z" fill={c} />,
};
const ONBOARDING_ORDER = Object.keys(SCREEN_EMBLEMS);

function OnboardingMedal({ id, earned }) {
  const draw = SCREEN_EMBLEMS[id];
  const step = ONBOARDING_ORDER.indexOf(id);
  const body = earned ? '#5E3463' : LOCKED.mark;
  const ear = earned ? '#F88F4A' : LOCKED.mark;
  const glow = earned ? '#FBAE3D' : 'var(--pf-lock-rim, #3A3A40)';
  return (
    <>
      <circle cx="60" cy="60" r="56" fill={earned ? '#FBAE3D' : LOCKED.rim} />
      <circle cx="60" cy="60" r="46" fill={earned ? '#132034' : LOCKED.fill} />
      <ellipse cx="25" cy="59" rx="6" ry="10" fill={ear} />
      <ellipse cx="95" cy="59" rx="6" ry="10" fill={ear} />
      <rect x="28" y="34" width="64" height="52" rx="17" fill={body} />
      <rect x="35" y="41" width="50" height="38" rx="12" fill="#141012" />
      {draw ? draw(glow) : <circle cx="60" cy="60" r="8" fill={glow} />}
      {/* Five dots under the robot: one lights per step, like a charging battery */}
      {step >= 0 && ONBOARDING_ORDER.map((s, i) => (
        <circle key={s} cx={44 + i * 8} cy="96" r="2.8" fill={earned && i <= step ? '#FBAE3D' : LOCKED.mark} opacity={earned && i > step ? 0.5 : 1} />
      ))}
    </>
  );
}

/* ---------------- streak shields ---------------- */

function Star({ x, y, r = 4.5, fill }) {
  const p = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const d = i % 2 ? r * 0.45 : r;
    return `${(x + d * Math.cos(a)).toFixed(1)},${(y + d * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return <polygon points={p} fill={fill} />;
}

function Wings({ fill }) {
  return (
    <g fill={fill}>
      <path d="M16 34 C4 40 2 56 8 68 C10 58 13 52 18 48 Z" />
      <path d="M104 34 C116 40 118 56 112 68 C110 58 107 52 102 48 Z" />
    </g>
  );
}

function StreakMedal({ earned, tier, days }) {
  const c = earned ? STREAK_TIER_COLOURS[tier] || STREAK_TIER_COLOURS.coral : null;
  const inTier = STREAK_MEDALS.filter((m) => m.tier === tier);
  const stars = Math.max(1, inTier.findIndex((m) => m.days === days) + 1);
  const big = ['plum', 'purple', 'night'].includes(tier);
  const label = days !== undefined ? String(days) : '';
  return (
    <>
      {big && <Wings fill={c ? c.rim : LOCKED.rim} />}
      <path d={SHIELD_OUTER} fill={c ? c.rim : LOCKED.rim} />
      <path d={SHIELD_INNER} fill={c ? c.fill : LOCKED.fill} />
      {c && <path d="M60 15 L95 27 V50 H25 V27 Z" fill="#FFFFFF" opacity="0.1" />}
      {tier === 'night' && c && [[36, 36], [86, 40], [40, 74], [82, 72]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.6" fill="#F4F4F2" />)}
      <path d={FLAME} fill={c ? c.flame : LOCKED.mark} />
      {c && <path d={FLAME_CORE} fill={tier === 'cream' || tier === 'amber' ? '#FFFFFF' : '#FBAE3D'} opacity={tier === 'coral' || tier === 'plum' || tier === 'purple' ? 0 : 0.8} />}
      {label && (
        <text x="60" y="92" textAnchor="middle" fontWeight="700" fontSize={label.length > 3 ? 18 : 22} fill={c ? c.ink : LOCKED.mark} fontFamily="var(--pf-font-display, inherit)">{label}</text>
      )}
      {Array.from({ length: stars }, (_, i) => (
        <Star key={i} x={60 + (i - (stars - 1) / 2) * 11} y={103} fill={c ? c.ink : LOCKED.mark} />
      ))}
    </>
  );
}

/* ---------------- season coins ---------------- */

const MONTH_EMBLEMS = {
  // January: snowflake
  1: (c) => <path d="M60 40 V80 M43 50 L77 70 M43 70 L77 50 M54 42 L60 48 L66 42 M54 78 L60 72 L66 78" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  // February: heart
  2: (c) => <path d="M60 78 C44 66 38 58 40 50 C42 42 54 40 60 50 C66 40 78 42 80 50 C82 58 76 66 60 78 Z" fill={c} />,
  // March: sprout
  3: (c) => (
    <>
      <path d="M60 80 V58" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <path d="M60 60 C50 60 44 54 44 44 C54 44 60 50 60 60 Z M60 56 C60 46 66 40 76 40 C76 50 70 56 60 56 Z" fill={c} />
    </>
  ),
  // April: raindrops
  4: (c) => <path d="M50 40 C56 50 58 54 58 58 A8 8 0 0 1 42 58 C42 54 44 50 50 40 Z M70 52 C76 62 78 66 78 70 A8 8 0 0 1 62 70 C62 66 64 62 70 52 Z" fill={c} />,
  // May: flower
  5: (c) => (
    <>
      {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="60" cy="47" rx="7" ry="11" fill={c} transform={`rotate(${a} 60 60)`} />)}
      <circle cx="60" cy="60" r="6" fill="#132034" />
    </>
  ),
  // June: sun
  6: (c) => (
    <>
      <circle cx="60" cy="60" r="11" fill={c} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <path key={a} d="M60 41 V35" stroke={c} strokeWidth="4" strokeLinecap="round" transform={`rotate(${a} 60 60)`} />)}
    </>
  ),
  // July: waves
  7: (c) => <path d="M40 54 Q46 48 52 54 T64 54 T76 54 T82 54 M40 66 Q46 60 52 66 T64 66 T76 66 T82 66" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" />,
  // August: kite
  8: (c) => (
    <>
      <path d="M62 38 L76 54 L62 72 L48 54 Z" fill={c} />
      <path d="M62 72 Q56 78 60 82 T54 86" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  // September: open book
  9: (c) => <path d="M60 48 C54 43 46 42 40 44 V74 C46 72 54 73 60 78 C66 73 74 72 80 74 V44 C74 42 66 43 60 48 Z M60 48 V78" stroke={c} strokeWidth="3.5" fill="none" strokeLinejoin="round" />,
  // October: falling leaf
  10: (c) => (
    <>
      <path d="M44 74 C42 54 54 40 76 40 C78 62 64 76 44 74 Z" fill={c} />
      <path d="M44 74 L66 50" stroke="#132034" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  // November: diya lamp
  11: (c) => (
    <>
      <path d="M60 40 C66 48 66 54 60 58 C54 54 54 48 60 40 Z" fill={c} />
      <path d="M40 64 H80 C78 74 70 80 60 80 C50 80 42 74 40 64 Z" fill={c} />
    </>
  ),
  // December: star
  12: (c) => <Star x={60} y={61} r={22} fill={c} />,
};

function Laurels({ fill }) {
  const leaves = [0, 1, 2, 3, 4];
  return (
    <g fill={fill}>
      {leaves.map((i) => {
        const a = 236 - i * 26;
        const rad = (a * Math.PI) / 180;
        const x = 60 + 47 * Math.cos(rad);
        const y = 60 - 47 * Math.sin(rad);
        return (
          <g key={i}>
            <ellipse cx={x} cy={y} rx="4" ry="8" transform={`rotate(${-a + 90 + 30} ${x} ${y})`} />
            <ellipse cx={120 - x} cy={y} rx="4" ry="8" transform={`rotate(${a - 90 - 30} ${120 - x} ${y})`} />
          </g>
        );
      })}
    </g>
  );
}

function SeasonMedal({ id = '', earned }) {
  const mark = earned ? '#FBAE3D' : LOCKED.mark;

  if (id.startsWith('pro.')) {
    const year = id.slice(4);
    return (
      <>
        <circle cx="60" cy="60" r="56" fill={earned ? '#FBAE3D' : LOCKED.rim} />
        <circle cx="60" cy="60" r="48" fill={earned ? '#5E3F75' : LOCKED.fill} />
        <path d="M14 60 H26 L32 50 M106 60 H94 L88 70 M60 14 V26 M60 106 V96" stroke={earned ? '#F88F4A' : LOCKED.mark} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="60" cy="60" r="30" fill="none" stroke={earned ? '#F88F4A' : LOCKED.mark} strokeWidth="2" opacity="0.6" />
        {[[32, 50], [88, 70], [60, 26], [60, 96]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill={mark} />)}
        <text x="60" y="58" textAnchor="middle" fontWeight="700" fontSize="20" fill={mark} fontFamily="var(--pf-font-display, inherit)">PRO</text>
        <text x="60" y="77" textAnchor="middle" fontWeight="700" fontSize="13" fill={earned ? '#F4F4F2' : LOCKED.mark} fontFamily="var(--pf-font-display, inherit)">{year}</text>
      </>
    );
  }

  if (id.startsWith('year.')) {
    const year = id.slice(5);
    return (
      <>
        <circle cx="60" cy="60" r="57" fill={earned ? '#FBAE3D' : LOCKED.rim} />
        <circle cx="60" cy="60" r="52" fill={earned ? '#132034' : LOCKED.fill} />
        <Laurels fill={earned ? '#F88F4A' : LOCKED.mark} />
        <circle cx="60" cy="60" r="30" fill={earned ? '#96456E' : LOCKED.rim} />
        <Star x={60} y={44} r={6} fill={mark} />
        <text x="60" y="72" textAnchor="middle" fontWeight="700" fontSize="17" fill={earned ? '#F4F4F2' : LOCKED.mark} fontFamily="var(--pf-font-display, inherit)">{year}</text>
      </>
    );
  }

  // month.YYYY-MM
  const month = Number(id.slice(-2));
  const draw = MONTH_EMBLEMS[month];
  return (
    <>
      <circle cx="60" cy="60" r="56" fill={earned ? '#2B4570' : LOCKED.rim} />
      <circle cx="60" cy="60" r="46" fill={earned ? '#4D345E' : LOCKED.fill} />
      {/* Twelve dots round the edge, this month's one lit */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (Math.PI / 6) * i - Math.PI / 2;
        const on = i + 1 === month;
        return <circle key={i} cx={60 + 51 * Math.cos(a)} cy={60 + 51 * Math.sin(a)} r={on ? 3.6 : 2} fill={on ? mark : earned ? '#132034' : LOCKED.fill} />;
      })}
      {draw ? draw(mark) : <circle cx="60" cy="60" r="16" fill={mark} />}
    </>
  );
}

/**
 * One medal. family: 'task' | 'onboarding' | 'streak' | 'season'. `id` picks the picture:
 * a task id ('unit1.bisection' or 'task.unit1.bisection'), an onboarding id, or 'month.2026-10',
 * 'year.2026' or 'pro.2026'.
 */
export function MedalBadge({ family = 'task', id, earned = false, fill, rim, tier = 'coral', days, label, size = 56 }) {
  const common = { width: size, height: size, role: label ? 'img' : undefined, 'aria-label': label || undefined, 'aria-hidden': label ? undefined : 'true' };
  const key = family === 'task' && id?.startsWith('task.') ? id.slice(5) : id;

  if (family === 'streak') {
    return <svg {...common} viewBox="0 0 120 128"><StreakMedal earned={earned} tier={tier} days={days} /></svg>;
  }
  if (family === 'onboarding') {
    return <svg {...common} viewBox="0 0 120 120"><OnboardingMedal id={key} earned={earned} /></svg>;
  }
  if (family === 'season') {
    return <svg {...common} viewBox="0 0 120 120"><SeasonMedal id={key} earned={earned} /></svg>;
  }
  return <svg {...common} viewBox="0 0 120 120"><TaskMedal id={key} earned={earned} fill={fill} rim={rim} /></svg>;
}
