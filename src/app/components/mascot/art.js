'use client';

/**
 * Small pieces of NETZ art used on the Profile page and around the app: the robot's head for
 * avatars, the default banner, and one badge for every medal family (NETZ_MEDALS_CATALOG.md).
 * Colours are the bg1 sunset palette.
 */

const HEX_OUTER = '60,4 108.5,32 108.5,88 60,116 11.5,88 11.5,32';
const HEX_INNER = '60,14 99.8,37 99.8,83 60,106 20.2,83 20.2,37';
const SHIELD_OUTER = 'M60 6 L104 21 V60 C104 88 85 108 60 122 C35 108 16 88 16 60 V21 Z';
const SHIELD_INNER = 'M60 15 L95 27 V60 C95 83 80 100 60 112 C40 100 25 83 25 60 V27 Z';
const FLAME = 'M60 26 C69 37 76 45 73 56 C71 64 66 68 60 68 C54 68 48 64 47 56 C46 49 51 42 55 38 C56 44 58 47 60 48 C62 40 59 33 60 26 Z';

const LOCKED = { rim: 'var(--pf-lock-rim, #3A3A40)', fill: 'var(--pf-lock-fill, #26262A)', mark: 'var(--pf-lock-mark, #6B6B73)' };

export const STREAK_TIER_COLOURS = {
  coral: { rim: '#A63E48', fill: '#D55E64', flame: '#FBAE3D', ink: '#FFFFFF' },
  orange: { rim: '#C2632A', fill: '#F88F4A', flame: '#D55E64', ink: '#3A1A0A' },
  amber: { rim: '#C98318', fill: '#FBAE3D', flame: '#D55E64', ink: '#5A3A00' },
  cream: { rim: '#B9A9A2', fill: '#F4F0EA', flame: '#F88F4A', ink: '#4D345E' },
  plum: { rim: '#6C2C4E', fill: '#96456E', flame: '#FBAE3D', ink: '#FFFFFF' },
  purple: { rim: '#33213F', fill: '#5E3F75', flame: '#FBAE3D', ink: '#FFFFFF' },
  night: { rim: '#FBAE3D', fill: '#132034', flame: '#D55E64', ink: '#FBAE3D' },
};

function Lock() {
  return (
    <g>
      <path d="M51 58 V51 A9 9 0 0 1 69 51 V58" stroke={LOCKED.mark} strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="45" y="57" width="30" height="24" rx="6" fill={LOCKED.mark} />
    </g>
  );
}

/**
 * One medal. family: 'task' | 'onboarding' | 'streak' | 'season'.
 * The detailed emblem art per medal comes later; for now each family has its frame and a simple mark.
 */
export function MedalBadge({ family = 'task', earned = false, fill, rim, tier = 'coral', days, label, size = 56 }) {
  const common = { width: size, height: size, viewBox: '0 0 120 120', role: 'img', 'aria-label': label };

  if (family === 'streak') {
    const c = earned ? STREAK_TIER_COLOURS[tier] || STREAK_TIER_COLOURS.coral : null;
    return (
      <svg {...common} viewBox="0 0 120 128">
        <path d={SHIELD_OUTER} fill={c ? c.rim : LOCKED.rim} />
        <path d={SHIELD_INNER} fill={c ? c.fill : LOCKED.fill} />
        {c ? <path d={FLAME} fill={c.flame} /> : <Lock />}
        {days !== undefined && (
          <text x="60" y="98" textAnchor="middle" fontWeight="700" fontSize={String(days).length > 3 ? 18 : 22} fill={c ? c.ink : LOCKED.mark} fontFamily="var(--pf-font-display, inherit)">{days}</text>
        )}
      </svg>
    );
  }

  if (family === 'onboarding') {
    return (
      <svg {...common}>
        <circle cx="60" cy="60" r="56" fill={earned ? '#FBAE3D' : LOCKED.rim} />
        <circle cx="60" cy="60" r="44" fill={earned ? '#132034' : LOCKED.fill} />
        {earned ? (
          <g transform="translate(60 62) scale(0.36) translate(-120 -94)">
            <rect x="44" y="32" width="146" height="114" rx="38" fill="#5E3463" />
            <rect x="62" y="50" width="112" height="80" rx="26" fill="#141012" />
            <ellipse cx="100" cy="86" rx="9" ry="13" fill="#FBAE3D" />
            <ellipse cx="140" cy="86" rx="9" ry="13" fill="#FBAE3D" />
          </g>
        ) : <Lock />}
      </svg>
    );
  }

  if (family === 'season') {
    return (
      <svg {...common}>
        <circle cx="60" cy="60" r="56" fill={earned ? '#132034' : LOCKED.rim} />
        <circle cx="60" cy="60" r="42" fill={earned ? '#4D345E' : LOCKED.fill} />
        {earned ? <circle cx="60" cy="60" r="16" fill="#FBAE3D" /> : <Lock />}
      </svg>
    );
  }

  return (
    <svg {...common}>
      <polygon points={HEX_OUTER} fill={earned ? rim : LOCKED.rim} />
      <polygon points={HEX_INNER} fill={earned ? fill : LOCKED.fill} />
      {earned ? <circle cx="60" cy="60" r="14" fill="rgba(255,255,255,0.55)" /> : <Lock />}
    </svg>
  );
}

/** The robot's head, for avatars. */
export function RobotHead({ size = 92, title = 'Your robot' }) {
  return (
    <svg width={size} height={Math.round(size * 132 / 200)} viewBox="20 28 200 132" role="img" aria-label={title}>
      <ellipse cx="40" cy="94" rx="15" ry="24" fill="#F88F4A" />
      <ellipse cx="36" cy="94" rx="7" ry="14" fill="#D55E64" />
      <ellipse cx="200" cy="94" rx="15" ry="24" fill="#F88F4A" />
      <ellipse cx="204" cy="94" rx="7" ry="14" fill="#D55E64" />
      <rect x="50" y="38" width="146" height="116" rx="38" fill="#46264D" />
      <rect x="44" y="32" width="146" height="114" rx="38" fill="#5E3463" />
      <rect x="62" y="50" width="112" height="80" rx="26" fill="#141012" />
      <ellipse cx="100" cy="86" rx="9" ry="13" fill="#FBAE3D" />
      <ellipse cx="140" cy="86" rx="9" ry="13" fill="#FBAE3D" />
      <path d="M110 108 Q120 116 130 108" stroke="#FBAE3D" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** The free starter banner, "Sunset Bands" (the site background as a banner). */
export function SunsetBandsBanner({ height = 200, className = '' }) {
  return (
    <svg width="100%" height={height} viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice" className={className} style={{ display: 'block' }} role="img" aria-label="Banner: Sunset Bands">
      <rect width="800" height="200" fill="#141415" />
      <path d="M180 0 H330 Q250 100 200 200 H60 Q120 100 180 0 Z" fill="#132034" />
      <path d="M330 0 H470 Q390 100 340 200 H200 Q250 100 330 0 Z" fill="#4D345E" />
      <path d="M470 0 H600 Q520 100 470 200 H340 Q390 100 470 0 Z" fill="#96456E" />
      <path d="M600 0 H720 Q640 100 600 200 H470 Q520 100 600 0 Z" fill="#D55E64" />
      <path d="M720 0 H800 Q760 100 720 200 H600 Q640 100 720 0 Z" fill="#F88F4A" />
      <path d="M800 0 V200 H720 Q760 100 800 0 Z" fill="#FBAE3D" />
    </svg>
  );
}

export function FlameIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1 C11 4 13 6 12.5 9.5 C12 12.5 10 14.5 8 14.5 C6 14.5 3.5 12.5 3.5 9.5 C3.5 7 5.5 5.5 6.5 4 C7 6 7.5 6.5 8 7 C8.5 5 7.5 3 8 1 Z" fill="#F88F4A" />
      <path d="M8 7.5 C9.5 9 10 10 9.7 11.3 C9.4 12.4 8.7 13 8 13 C7.3 13 6.4 12.4 6.3 11.3 C6.2 10.2 7.2 9.2 8 7.5 Z" fill="#FBAE3D" />
    </svg>
  );
}

export function GemIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2 H12 L15 6 L8 14.5 L1 6 Z" fill="#FBAE3D" />
      <path d="M1 6 H15 M5.5 2 L8 14.5 L10.5 2" stroke="#C98318" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

export function MedalIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <polygon points="8,1 14,4.5 14,11.5 8,15 2,11.5 2,4.5" fill="#D55E64" />
    </svg>
  );
}
