'use client';

import { useEffect, useRef, useState } from 'react';
import { IconCheck, IconEraser, IconPen } from './icons';

// The handwritten equation, one glyph at a time; '^' marks the raised 2
const INK = ['x', '^2', ' ', '−', ' ', '4', 'x', ' ', '+', ' ', '3', ' ', '=', ' ', '0'];

/**
 * The hero demo (board artboard 3): a loop of about 9 seconds that keeps playing by itself.
 * The equation is written glyph by glyph behind a pen tip, NETZ reads it (a short sweep), the
 * typed maths rises in, Find roots is tapped, and the answer appears with a small graph marking
 * the two roots. It holds, fades out and starts again. CSS does all of it (landing.css,
 * "Hero demo"); the loop pauses while the card is off screen, and "reduce motion" shows the
 * finished scene without moving.
 */
export default function HeroDemo() {
  const [waiting, setWaiting] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setWaiting(!entry.isIntersecting), { threshold: 0.2 });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  let glyph = 0;
  const ink = INK.map((ch, i) => {
    if (ch === ' ') return <span key={i} className="ld-ink-gap" />;
    glyph += 1;
    const sup = ch.startsWith('^');
    return (
      <span key={i} className={`ld-glyph${sup ? ' is-sup' : ''}`} style={{ '--g': glyph }}>
        {sup ? ch.slice(1) : ch}
      </span>
    );
  });

  return (
    <div className="ld-demo-col">
      <div
        ref={cardRef}
        className={`ld-demo${waiting ? ' is-waiting' : ''}`}
        role="img"
        aria-label="Playground example: the handwritten equation x squared minus 4x plus 3 equals 0 is typed, and Find roots gives x equals 1 or x equals 3."
      >
        <div className="ld-demo-bar" aria-hidden="true">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ld-demo-tab">Page 1</span>
            <span style={{ fontSize: 14, color: 'var(--ld-text2)' }}>Playground</span>
          </div>
          <div className="ld-demo-tools">
            <span className="ld-demo-tool is-on"><IconPen size={16} /></span>
            <span className="ld-demo-tool"><IconEraser size={16} /></span>
          </div>
        </div>

        <div className="ld-demo-body ld-grid-paper" aria-hidden="true">
          <div className="ld-ink-wrap">
            <div className="ld-ink">{ink}</div>
            <span className="ld-demo-pen"><IconPen size={22} /></span>
            <span className="ld-demo-scan" />
          </div>

          <div className="ld-typed d-typed">
            <span className="ld-tag ld-tag-teal">Typed</span>
            <span className="ld-math">
              x<sup style={{ fontSize: 14 }}>2</sup> − 4x + 3 = 0
            </span>
          </div>

          <div className="ld-eqbar d-bar">
            <span className="ld-eqbtn d-roots">
              Find roots
              <span className="ld-demo-tap" />
            </span>
            <span className="ld-eqbtn">Plot</span>
            <span className="ld-eqbtn">d/dx</span>
          </div>

          <div className="ld-demo-result">
            <div className="ld-answer d-answer">
              <IconCheck />
              <span className="ld-mono">x = 1 &nbsp; or &nbsp; x = 3</span>
            </div>
            <svg className="ld-demo-plot d-plot" viewBox="0 0 140 70">
              <path d="M4 48.5 H136" className="ld-demo-plot-axis" />
              <path d="M10 8 Q70 116 130 8" className="ld-demo-plot-curve" pathLength="1" />
              <circle cx="40" cy="48.5" r="4.5" className="ld-demo-plot-root" />
              <circle cx="100" cy="48.5" r="4.5" className="ld-demo-plot-root ld-demo-plot-root-2" />
              <text x="40" y="64" className="ld-demo-plot-label">1</text>
              <text x="100" y="64" className="ld-demo-plot-label">3</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
