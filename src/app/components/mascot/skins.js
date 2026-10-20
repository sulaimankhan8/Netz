/**
 * Robot skins (board artboard 13): each one is a colour palette plus optional layers drawn under the
 * robot, over its body, and over its head. Head layers sit inside the head group, so hats move with
 * the head when the robot reacts. Faces never change, so every reaction works with every skin.
 * Coordinates are the robot's own (viewBox 0 -30 240 290).
 */

import { DEFAULT_SKIN } from '@/app/utils/progress/shop';

export const BASE_PALETTE = {
  body: '#5E3463', shade: '#46264D', ear: '#F88F4A', earInner: '#D55E64', hands: '#D55E64',
  arms: '#5E3463', keys: '#2E1A33', eqKey: '#F88F4A', headStroke: null,
};

const LOOKS = {
  'skin.classic': {},

  'skin.lab-coat': {
    palette: { arms: '#F4F4F2' },
    body: (
      <>
        <path d="M72 168 Q72 144 97 144 L108 144 L104 214 L84 214 Q72 214 72 200 Z" fill="#F4F4F2" />
        <path d="M162 168 Q162 144 137 144 L126 144 L130 214 L150 214 Q162 214 162 200 Z" fill="#F4F4F2" />
        <path d="M97 144 L112 164 L108 144 Z M137 144 L122 164 L126 144 Z" fill="#DAD6CF" />
        <rect x="138" y="178" width="16" height="13" rx="3" fill="#DAD6CF" />
        <rect x="143" y="166" width="5" height="16" rx="2.5" fill="#4F46E5" />
      </>
    ),
  },

  'skin.winter': {
    hat: true,
    body: (
      <>
        <rect x="68" y="138" width="98" height="18" rx="9" fill="#D55E64" />
        <rect x="132" y="150" width="18" height="44" rx="7" fill="#D55E64" />
        <path d="M134 166 H148 M134 178 H148" stroke="#FBAE3D" strokeWidth="3" />
      </>
    ),
    head: (
      <>
        <path d="M50 44 Q50 -6 120 -6 Q190 -6 190 44 Z" fill="#F88F4A" />
        <rect x="46" y="34" width="148" height="16" rx="8" fill="#D55E64" />
        <path d="M70 20 V36 M95 6 V36 M120 0 V36 M145 6 V36 M170 20 V36" stroke="#D9702E" strokeWidth="3" opacity="0.6" />
        <circle cx="120" cy="-12" r="12" fill="#F4F4F2" />
      </>
    ),
  },

  'skin.grad-cap': {
    hat: true,
    head: (
      <>
        <path d="M92 40 V52 Q120 64 148 52 V40 Z" fill="#2A2A2D" />
        <path d="M60 36 L120 12 L180 36 L120 60 Z" fill="#141415" />
        <path d="M120 36 L170 42 L170 70" stroke="#FBAE3D" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="170" cy="74" r="6" fill="#FBAE3D" />
      </>
    ),
  },

  'skin.headphones': {
    hat: true,
    head: (
      <>
        <path d="M38 84 Q38 4 120 4 Q202 4 202 84" stroke="#132034" strokeWidth="12" fill="none" strokeLinecap="round" />
        <rect x="20" y="68" width="36" height="52" rx="15" fill="#132034" />
        <rect x="27" y="80" width="12" height="28" rx="6" fill="#F88F4A" />
        <rect x="184" y="68" width="36" height="52" rx="15" fill="#132034" />
        <rect x="201" y="80" width="12" height="28" rx="6" fill="#F88F4A" />
        <circle cx="214" cy="20" r="6" fill="#FBAE3D" />
        <path d="M220 20 V2 L230 6" stroke="#FBAE3D" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ),
  },

  'skin.neon-night': {
    palette: { body: '#132034', shade: '#0C1626', arms: '#132034', ear: '#FBAE3D', earInner: '#F88F4A', hands: '#F88F4A', keys: '#2B4570', headStroke: '#F88F4A' },
    under: <circle cx="120" cy="120" r="118" fill="#F88F4A" opacity="0.08" />,
  },

  'skin.wizard': {
    hat: true,
    head: (
      <>
        <path d="M58 42 L182 42 L136 -28 Z" fill="#4D345E" />
        <path d="M136 -28 Q150 -30 156 -20" stroke="#4D345E" strokeWidth="6" fill="none" strokeLinecap="round" />
        <ellipse cx="120" cy="42" rx="78" ry="10" fill="#33213F" />
        <circle cx="118" cy="10" r="4.5" fill="#FBAE3D" />
        <circle cx="134" cy="26" r="3" fill="#FBAE3D" />
        <circle cx="102" cy="30" r="2.5" fill="#FBAE3D" />
        <circle cx="140" cy="-4" r="2.5" fill="#FBAE3D" />
      </>
    ),
  },

  'skin.astronaut': {
    hat: true,
    body: <rect x="64" y="138" width="112" height="16" rx="8" fill="#DCEAF3" />,
    head: (
      <>
        <circle cx="120" cy="90" r="98" fill="#B9E6FF" opacity="0.12" stroke="#DCEAF3" strokeWidth="5" />
        <path d="M56 50 Q72 18 110 8" stroke="#FFFFFF" strokeWidth="6" fill="none" opacity="0.5" strokeLinecap="round" />
      </>
    ),
  },

  'skin.circuit-2026': {
    palette: { body: '#FBAE3D', shade: '#C98318', arms: '#FBAE3D', ear: '#132034', earInner: '#4D345E', hands: '#132034', keys: '#C98318', eqKey: '#132034' },
    under: <circle cx="120" cy="120" r="118" fill="#FBAE3D" opacity="0.08" />,
    body: <path d="M78 200 H96 L102 194 M156 160 H148 L144 166" stroke="#132034" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />,
    head: (
      <>
        <path d="M50 120 H64 L72 128 H90 M190 60 H178 L172 52 H150 M120 32 V22 L130 14" stroke="#132034" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="130" cy="14" r="5" fill="#D55E64" />
        <circle cx="90" cy="128" r="4" fill="#132034" />
        <circle cx="150" cy="52" r="4" fill="#132034" />
      </>
    ),
  },
};

/** Everything needed to draw a skin; unknown ids fall back to Classic. */
export function skinLook(id = DEFAULT_SKIN) {
  const look = LOOKS[id] || LOOKS[DEFAULT_SKIN];
  return { palette: { ...BASE_PALETTE, ...(look.palette || {}) }, under: look.under || null, body: look.body || null, head: look.head || null, hat: !!look.hat };
}
