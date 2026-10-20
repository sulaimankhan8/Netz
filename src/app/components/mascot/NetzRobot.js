'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './netzRobot.css';
import { skinLook } from './skins';
import { loadProgress, PROGRESS_EVENT } from '@/app/utils/progress/engine';
import { DEFAULT_SKIN, equippedSkin } from '@/app/utils/progress/shop';

/**
 * The NETZ robot, "Classic Calc" (NETZ_MEDALS_CATALOG.md, Mascot). Drawn as separate parts so it can
 * move: head with a screen face, arms, keypad and an "=" key.
 *
 * Moods: idle, wave, think, press, cheer, surp, sad, sleep, wake.
 * Pass `mood` to hold one, or let it react: robotReact('cheer') anywhere in the app plays that
 * reaction on every robot with `listen` (the default).
 *
 * `skin` dresses it (shop skins, board artboard 13); without it the robot wears the student's own skin.
 */

export const ROBOT_EVENT = 'netz:robot';

// Each reaction is a list of [mood, milliseconds]; the robot returns to idle afterwards
export const REACTIONS = {
  hello: [['wave', 2400]],
  solve: [['think', 1800], ['press', 500], ['cheer', 2000]],
  thinking: [['think', 1800]],
  cheer: [['cheer', 2800]],
  error: [['surp', 1800]],
  sad: [['sad', 3400]],
  wake: [['wake', 1600], ['wave', 1400]],
};

/** Plays a reaction on the robots that are listening. */
export function robotReact(name) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ROBOT_EVENT, { detail: { name } }));
}

export default function NetzRobot({
  size = 160,
  mood: heldMood,
  listen = true,
  trackPointer = false,
  sleepAfterMs = 0,
  title = 'NETZ robot',
  className = '',
  style,
  skin,
}) {
  const [playing, setPlaying] = useState('idle');
  const [worn, setWorn] = useState(DEFAULT_SKIN);
  const [eyes, setEyes] = useState({ x: 0, y: 0 });
  const rootRef = useRef(null);
  const timerRef = useRef(null);
  const lastActiveRef = useRef(Date.now());
  const frameRef = useRef(0);

  const mood = heldMood || playing;
  const playingRef = useRef(playing);
  playingRef.current = playing;

  const play = useCallback((steps) => {
    clearTimeout(timerRef.current);
    lastActiveRef.current = Date.now();
    let i = 0;
    const step = () => {
      if (i >= steps.length) {
        setPlaying('idle');
        return;
      }
      const [next, ms] = steps[i++];
      setPlaying(next);
      setEyes({ x: 0, y: 0 });
      timerRef.current = setTimeout(step, ms);
    };
    step();
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // No skin given: wear the student's own, and change with it
  useEffect(() => {
    if (skin) return undefined;
    const read = () => setWorn(equippedSkin(loadProgress()));
    read();
    window.addEventListener(PROGRESS_EVENT, read);
    return () => window.removeEventListener(PROGRESS_EVENT, read);
  }, [skin]);

  useEffect(() => {
    if (!listen) return undefined;
    const onReact = (e) => {
      const steps = REACTIONS[e.detail?.name];
      if (!steps) return;
      // A sleeping robot wakes up first
      if (playingRef.current === 'sleep' && e.detail.name !== 'wake') play([...REACTIONS.wake.slice(0, 1), ...steps]);
      else play(steps);
    };
    window.addEventListener(ROBOT_EVENT, onReact);
    return () => window.removeEventListener(ROBOT_EVENT, onReact);
  }, [listen, play]);

  // Falls asleep after a quiet while; any pointer or key wakes it
  useEffect(() => {
    if (!sleepAfterMs) return undefined;
    const poke = () => {
      lastActiveRef.current = Date.now();
      if (playingRef.current === 'sleep') play(REACTIONS.wake);
    };
    const check = setInterval(() => {
      if (playingRef.current === 'idle' && Date.now() - lastActiveRef.current > sleepAfterMs) setPlaying('sleep');
    }, 1000);
    window.addEventListener('pointerdown', poke);
    window.addEventListener('keydown', poke);
    return () => {
      clearInterval(check);
      window.removeEventListener('pointerdown', poke);
      window.removeEventListener('keydown', poke);
    };
  }, [sleepAfterMs, play]);

  // Eyes follow the pointer while idle (one update per frame at most)
  useEffect(() => {
    if (!trackPointer) return undefined;
    const onMove = (e) => {
      if (frameRef.current) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0;
        const el = rootRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const reach = Math.max(r.width, 240);
        const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / reach));
        const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.36)) / reach));
        setEyes({ x: Math.round(dx * 7), y: Math.round(dy * 5) });
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [trackPointer]);

  const eyeShift = mood === 'idle' ? eyes : { x: 0, y: 0 };
  const look = skinLook(skin || worn);
  const c = look.palette;

  return (
    <span ref={rootRef} className={`nr nr-${mood} ${className}`} style={{ display: 'inline-block', lineHeight: 0, ...style }}>
      <svg width={size} height={Math.round(size * 290 / 240)} viewBox="0 -30 240 290" role="img" aria-label={title}>
        <ellipse cx="120" cy="248" rx="58" ry="8" fill="#000000" opacity="0.3" />
        {look.under}
        <g className="nr-rig">
          <g className="nr-fx nr-fx-rays">
            <path d="M120 4 V16 M84 12 L90 22 M156 12 L150 22 M60 30 L70 36 M180 30 L170 36" stroke="#FBAE3D" strokeWidth="5" strokeLinecap="round" />
          </g>
          <rect x="88" y="206" width="24" height="30" rx="11" fill={c.shade} />
          <rect x="128" y="206" width="24" height="30" rx="11" fill={c.shade} />
          <ellipse cx="99" cy="238" rx="18" ry="9" fill={c.hands} />
          <ellipse cx="141" cy="238" rx="18" ry="9" fill={c.hands} />
          <g className="nr-arm-l">
            <ellipse cx="70" cy="182" rx="13" ry="22" fill={c.arms} transform="rotate(18 70 182)" />
            <circle cx="63" cy="202" r="14" fill={c.hands} />
          </g>
          <rect x="74" y="146" width="92" height="74" rx="26" fill={c.shade} />
          <rect x="72" y="144" width="90" height="70" rx="25" fill={c.body} />
          {[160, 174, 188].map((y) => (
            <g key={y}>
              <rect x="86" y={y} width="16" height="9" rx="4.5" fill={c.keys} />
              <rect x="106" y={y} width="16" height="9" rx="4.5" fill={c.keys} />
            </g>
          ))}
          <g className="nr-eqkey">
            <rect x="128" y="158" width="24" height="40" rx="8" fill={c.eqKey} />
            <path d="M134 172 H146 M134 183 H146" stroke="#F4F4F2" strokeWidth="4" strokeLinecap="round" />
          </g>
          {look.body}
          <g className="nr-arm-r">
            <ellipse cx="170" cy="182" rx="13" ry="22" fill={c.arms} transform="rotate(-18 170 182)" />
            <circle cx="177" cy="202" r="14" fill={c.hands} />
          </g>
          <g className="nr-head">
            <ellipse cx="40" cy="94" rx="15" ry="24" fill={c.ear} />
            <ellipse cx="36" cy="94" rx="7" ry="14" fill={c.earInner} />
            <ellipse cx="200" cy="94" rx="15" ry="24" fill={c.ear} />
            <ellipse cx="204" cy="94" rx="7" ry="14" fill={c.earInner} />
            <rect x="50" y="38" width="146" height="116" rx="38" fill={c.shade} />
            <rect x="44" y="32" width="146" height="114" rx="38" fill={c.body} stroke={c.headStroke || undefined} strokeWidth={c.headStroke ? 3 : undefined} />
            <path d="M70 40 C78 36 90 35 104 35" stroke="#8A4C8C" strokeWidth="5" fill="none" strokeLinecap="round" />
            <rect className="nr-screen" x="62" y="50" width="112" height="80" rx="26" fill="#141012" />

            <g className="nr-face nr-f-happy">
              <g className="nr-eyes" style={{ transform: `translate(${eyeShift.x}px, ${eyeShift.y}px)` }}>
                <g className="nr-blink">
                  <ellipse cx="100" cy="86" rx="9" ry="13" fill="#FBAE3D" />
                  <ellipse cx="140" cy="86" rx="9" ry="13" fill="#FBAE3D" />
                  <circle cx="103" cy="81" r="3" fill="#FFFFFF" />
                  <circle cx="143" cy="81" r="3" fill="#FFFFFF" />
                </g>
              </g>
              <path d="M110 108 Q120 116 130 108" stroke="#FBAE3D" strokeWidth="5" fill="none" strokeLinecap="round" />
            </g>
            <g className="nr-face nr-f-joy">
              <path d="M90 90 Q100 76 110 90 M130 90 Q140 76 150 90" stroke="#FBAE3D" strokeWidth="5.5" fill="none" strokeLinecap="round" />
              <path d="M107 104 Q120 122 133 104 Z" fill="#FBAE3D" />
            </g>
            <g className="nr-face nr-f-think">
              <ellipse cx="106" cy="82" rx="7" ry="10" fill="#FBAE3D" />
              <ellipse cx="146" cy="80" rx="7" ry="10" fill="#FBAE3D" />
              <circle cx="108" cy="78" r="2.5" fill="#FFFFFF" />
              <circle cx="148" cy="76" r="2.5" fill="#FFFFFF" />
              <path d="M112 112 H128" stroke="#FBAE3D" strokeWidth="5" strokeLinecap="round" />
            </g>
            <g className="nr-face nr-f-surp">
              <circle cx="100" cy="86" r="11" fill="none" stroke="#FBAE3D" strokeWidth="5" />
              <circle cx="140" cy="86" r="11" fill="none" stroke="#FBAE3D" strokeWidth="5" />
              <circle cx="120" cy="114" r="6" fill="#FBAE3D" />
            </g>
            <g className="nr-face nr-f-sad">
              <path d="M90 84 Q100 96 110 84 M130 84 Q140 96 150 84" stroke="#FBAE3D" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M110 116 Q120 108 130 116" stroke="#FBAE3D" strokeWidth="5" fill="none" strokeLinecap="round" />
            </g>
            <g className="nr-face nr-f-sleep">
              <path d="M90 90 Q100 98 110 90 M130 90 Q140 98 150 90" stroke="#FBAE3D" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M115 112 H125" stroke="#FBAE3D" strokeWidth="4" strokeLinecap="round" />
            </g>
            <g className="nr-face nr-f-yawn">
              <path d="M90 86 H110 M130 86 H150" stroke="#FBAE3D" strokeWidth="5" strokeLinecap="round" />
              <ellipse className="nr-yawn" cx="120" cy="112" rx="8" ry="10" fill="#FBAE3D" />
            </g>

            <g className="nr-fx nr-fx-dots">
              <circle cx="188" cy="38" r="5" fill="#F88F4A" />
              <circle cx="200" cy="22" r="7" fill="#F88F4A" />
            </g>
            <g className="nr-fx nr-fx-drop">
              <path d="M186 46 C186 46 180 55 180 59 A6 6 0 0 0 192 59 C192 55 186 46 186 46 Z" fill="#7DD3FC" />
            </g>
            <g className="nr-fx nr-fx-zzz">
              <text x="180" y="40" fontFamily="inherit" fontWeight="700" fontSize="16" fill="#F88F4A">z</text>
              <text x="192" y="28" fontFamily="inherit" fontWeight="700" fontSize="20" fill="#F88F4A">z</text>
              <text x="206" y="14" fontFamily="inherit" fontWeight="700" fontSize="24" fill="#F88F4A">Z</text>
            </g>
            {look.head}
          </g>
        </g>
      </svg>
    </span>
  );
}
