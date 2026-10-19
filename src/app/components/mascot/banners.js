'use client';

import { useId } from 'react';
import { BANNER_BY_ID, DEFAULT_BANNER } from '@/app/utils/progress/shop';

/**
 * The shop banners (board artboard 7), drawn 4:1 with the key shapes in the middle half, so one
 * drawing works as the Profile header, a Notes cover and a shop card. Only the bg1 sunset colours.
 */

function SunsetBands() {
  return (
    <>
      <rect width="800" height="200" fill="#141415" />
      <path d="M180 0 H330 Q250 100 200 200 H60 Q120 100 180 0 Z" fill="#132034" />
      <path d="M330 0 H470 Q390 100 340 200 H200 Q250 100 330 0 Z" fill="#4D345E" />
      <path d="M470 0 H600 Q520 100 470 200 H340 Q390 100 470 0 Z" fill="#96456E" />
      <path d="M600 0 H720 Q640 100 600 200 H470 Q520 100 600 0 Z" fill="#D55E64" />
      <path d="M720 0 H800 Q760 100 720 200 H600 Q640 100 720 0 Z" fill="#F88F4A" />
      <path d="M800 0 V200 H720 Q760 100 800 0 Z" fill="#FBAE3D" />
    </>
  );
}

function HexNet({ uid }) {
  const hex = (x, y) => `${x - 27},${y} ${x - 13.5},${y - 23.4} ${x + 13.5},${y - 23.4} ${x + 27},${y} ${x + 13.5},${y + 23.4} ${x - 13.5},${y + 23.4}`;
  return (
    <>
      <defs>
        <pattern id={`${uid}-hex`} width="90" height="52" patternUnits="userSpaceOnUse">
          <path d="M0 26 L15 0 H45 L60 26 L45 52 H15 Z M45 0 L60 -26 H90 L105 0 L90 26 H60 Z M60 26 L45 52 M90 26 L105 52" fill="none" stroke="#2B4570" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="800" height="200" fill="#132034" />
      <rect width="800" height="200" fill={`url(#${uid}-hex)`} />
      <polygon points={hex(480, 78)} fill="#4D345E" />
      <polygon points={hex(570, 130)} fill="#FBAE3D" />
      <polygon points={hex(615, 104)} fill="#F88F4A" />
      <polygon points={hex(660, 130)} fill="#D55E64" />
      <polygon points={hex(705, 156)} fill="#96456E" />
      <polygon points={hex(750, 78)} fill="#F88F4A" opacity="0.5" />
    </>
  );
}

function GraphPaper({ uid }) {
  return (
    <>
      <defs>
        <pattern id={`${uid}-s`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0 H0 V20" fill="none" stroke="#1E3150" strokeWidth="1" /></pattern>
        <pattern id={`${uid}-l`} width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0 H0 V100" fill="none" stroke="#2B4570" strokeWidth="1.5" /></pattern>
      </defs>
      <rect width="800" height="200" fill="#132034" />
      <rect width="800" height="200" fill={`url(#${uid}-s)`} />
      <rect width="800" height="200" fill={`url(#${uid}-l)`} />
      <path d="M0 150 C120 150 160 40 300 60 S520 170 640 90 S760 40 800 50 V200 H0 Z" fill="#F88F4A" opacity="0.14" />
      <path d="M0 150 C120 150 160 40 300 60 S520 170 640 90 S760 40 800 50" stroke="#FBAE3D" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="300" cy="60" r="7" fill="#D55E64" />
      <circle cx="640" cy="90" r="7" fill="#D55E64" />
    </>
  );
}

function SineDunes() {
  return (
    <>
      <rect width="800" height="200" fill="#132034" />
      <circle cx="610" cy="66" r="30" fill="#FBAE3D" />
      <circle cx="120" cy="30" r="1.8" fill="#FFFFFF" opacity="0.7" />
      <circle cx="260" cy="48" r="1.4" fill="#FFFFFF" opacity="0.6" />
      <circle cx="420" cy="22" r="1.8" fill="#FFFFFF" opacity="0.8" />
      <path d="M0 90 C100 60 200 120 300 90 S500 60 600 90 S760 120 800 90 V200 H0 Z" fill="#4D345E" />
      <path d="M0 120 C120 95 220 145 340 118 S560 92 680 120 S780 140 800 125 V200 H0 Z" fill="#96456E" />
      <path d="M0 145 C140 125 240 168 380 145 S600 122 720 148 S790 158 800 150 V200 H0 Z" fill="#D55E64" />
      <path d="M0 168 C150 150 260 190 420 170 S640 150 760 172 L800 175 V200 H0 Z" fill="#F88F4A" />
      <path d="M0 188 C160 176 300 200 460 190 S700 178 800 192 V200 H0 Z" fill="#FBAE3D" />
    </>
  );
}

function DuskPeaks() {
  return (
    <>
      <rect width="800" height="200" fill="#132034" />
      <circle cx="150" cy="40" r="1.6" fill="#FFFFFF" opacity="0.7" />
      <circle cx="690" cy="30" r="1.8" fill="#FFFFFF" opacity="0.8" />
      <circle cx="400" cy="150" r="64" fill="#F88F4A" />
      <circle cx="400" cy="150" r="44" fill="#FBAE3D" />
      <path d="M0 200 L0 120 L120 60 L230 130 L340 70 L470 140 L590 50 L700 120 L800 80 V200 Z" fill="#4D345E" />
      <path d="M0 200 L0 160 L100 110 L210 160 L330 105 L450 170 L560 120 L680 165 L800 125 V200 Z" fill="#96456E" />
      <path d="M0 200 L0 185 L140 150 L260 190 L400 155 L520 192 L660 160 L800 190 V200 Z" fill="#D55E64" />
    </>
  );
}

const ORIGAMI = [
  ['0,0 180,0 0,140', '#132034'], ['180,0 210,130 0,140', '#2B4570'], ['180,0 320,0 210,130', '#96456E'],
  ['0,140 210,130 120,200', '#3A2648'], ['0,140 120,200 0,200', '#132034'], ['320,0 470,0 380,150', '#D55E64'],
  ['210,130 380,150 320,0', '#7A3A5B'], ['120,200 210,130 300,200', '#6C2C4E'], ['210,130 380,150 300,200', '#D55E64'],
  ['380,150 300,200 480,200', '#F88F4A'], ['470,0 620,0 540,120', '#F88F4A'], ['380,150 540,120 470,0', '#E8775A'],
  ['380,150 540,120 480,200', '#FBAE3D'], ['540,120 480,200 660,200', '#F88F4A'], ['620,0 800,0 720,110', '#FBAE3D'],
  ['540,120 720,110 620,0', '#FFC766'], ['540,120 720,110 660,200', '#FBAE3D'], ['720,110 660,200 800,200', '#F88F4A'],
  ['720,110 800,0 800,200', '#FFC766'],
];

function Origami() {
  return (
    <>
      <rect width="800" height="200" fill="#4D345E" />
      {ORIGAMI.map(([points, fill]) => <polygon key={points} points={points} fill={fill} />)}
    </>
  );
}

function Orbit() {
  return (
    <>
      <rect width="800" height="200" fill="#141415" />
      <circle cx="90" cy="40" r="1.8" fill="#FFFFFF" opacity="0.8" />
      <circle cx="230" cy="150" r="1.4" fill="#FFFFFF" opacity="0.6" />
      <circle cx="700" cy="30" r="1.8" fill="#FFFFFF" opacity="0.8" />
      <ellipse cx="480" cy="100" rx="290" ry="74" fill="none" stroke="#4D345E" strokeWidth="3" transform="rotate(-10 480 100)" />
      <ellipse cx="480" cy="100" rx="180" ry="46" fill="none" stroke="#96456E" strokeWidth="3" transform="rotate(-10 480 100)" />
      <circle cx="480" cy="100" r="36" fill="#F88F4A" />
      <ellipse cx="480" cy="100" rx="58" ry="12" fill="none" stroke="#FBAE3D" strokeWidth="4" transform="rotate(-10 480 100)" />
      <circle cx="306" cy="126" r="11" fill="#D55E64" />
      <circle cx="652" cy="70" r="8" fill="#FBAE3D" />
    </>
  );
}

function CircuitNight() {
  return (
    <>
      <rect width="800" height="200" fill="#132034" />
      <ellipse cx="640" cy="100" rx="120" ry="80" fill="#96456E" opacity="0.3" />
      <path d="M0 60 H120 L150 90 H260 L290 60 H360 M0 140 H80 L110 110 H200 M360 200 V160 L390 130 H470 L500 100 H600 M800 40 H740 L710 70 H680 M800 160 H740 L710 130 H680" stroke="#F88F4A" strokeWidth="3" fill="none" opacity="0.65" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="360" cy="60" r="6" fill="#FBAE3D" />
      <circle cx="200" cy="110" r="6" fill="#FBAE3D" />
      <path d="M610 64 V54 M630 64 V54 M650 64 V54 M670 64 V54 M610 136 V146 M630 136 V146 M650 136 V146 M670 136 V146" stroke="#FBAE3D" strokeWidth="4" strokeLinecap="round" />
      <rect x="600" y="64" width="80" height="72" rx="12" fill="#4D345E" stroke="#FBAE3D" strokeWidth="3" />
      <rect x="622" y="82" width="36" height="36" rx="6" fill="#FBAE3D" />
    </>
  );
}

const ART = {
  'banner.sunset-bands': SunsetBands,
  'banner.hex-net': HexNet,
  'banner.graph-paper': GraphPaper,
  'banner.sine-dunes': SineDunes,
  'banner.dusk-peaks': DuskPeaks,
  'banner.origami': Origami,
  'banner.orbit': Orbit,
  'banner.circuit-night': CircuitNight,
};

/** One banner, cropped to fill its box from the middle. */
export default function Banner({ id = DEFAULT_BANNER, height = 200, className = '', decorative = false }) {
  const uid = useId().replace(/:/g, '');
  const Art = ART[id] || SunsetBands;
  const name = BANNER_BY_ID[id]?.name || 'Sunset Bands';
  return (
    <svg
      width="100%"
      height={height}
      viewBox="0 0 800 200"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ display: 'block' }}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : `Banner: ${name}`}
    >
      <Art uid={uid} />
    </svg>
  );
}
