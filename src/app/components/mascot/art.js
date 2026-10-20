'use client';

import { skinLook } from './skins';

/**
 * Small pieces of NETZ art used on the Profile page and around the app: the robot's head for
 * avatars, the default banner and small icons. The medals themselves are in medals.js.
 * Colours are the bg1 sunset palette.
 */

export { MedalBadge, STREAK_TIER_COLOURS } from './medals';

/** The robot's head, for avatars, wearing a skin's colours and hat (board artboard 13). */
export function RobotHead({ size = 92, title = 'Your robot', skin }) {
  const look = skinLook(skin);
  const c = look.palette;
  // Hats stick out above the head, so those skins get a taller frame
  const box = look.hat ? '8 -34 224 200' : '20 28 200 132';
  const [, , w, h] = box.split(' ').map(Number);
  return (
    <svg width={size} height={Math.round((size * h) / w)} viewBox={box} role={title ? 'img' : undefined} aria-label={title || undefined} aria-hidden={title ? undefined : 'true'}>
      <ellipse cx="40" cy="94" rx="15" ry="24" fill={c.ear} />
      <ellipse cx="36" cy="94" rx="7" ry="14" fill={c.earInner} />
      <ellipse cx="200" cy="94" rx="15" ry="24" fill={c.ear} />
      <ellipse cx="204" cy="94" rx="7" ry="14" fill={c.earInner} />
      <rect x="50" y="38" width="146" height="116" rx="38" fill={c.shade} />
      <rect x="44" y="32" width="146" height="114" rx="38" fill={c.body} stroke={c.headStroke || undefined} strokeWidth={c.headStroke ? 3 : undefined} />
      <rect x="62" y="50" width="112" height="80" rx="26" fill="#141012" />
      <ellipse cx="100" cy="86" rx="9" ry="13" fill="#FBAE3D" />
      <ellipse cx="140" cy="86" rx="9" ry="13" fill="#FBAE3D" />
      <path d="M110 108 Q120 116 130 108" stroke="#FBAE3D" strokeWidth="5" fill="none" strokeLinecap="round" />
      {look.head}
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
