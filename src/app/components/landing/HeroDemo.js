'use client';

import { useEffect, useRef, useState } from 'react';
import { IconCheck, IconEraser, IconPen, IconReplay } from './icons';

/**
 * The one animation on the landing page (board artboard 3): an equation is written by hand, typed,
 * and solved with Find roots. Plays once and rests on the answer. If the card starts off screen it
 * waits and plays the first time it scrolls into view; Replay plays it again. CSS does the motion
 * (landing.css, ld-write / ld-rise / ld-press) and "reduce motion" shows the final frame.
 */
export default function HeroDemo() {
  const [run, setRun] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof IntersectionObserver === 'undefined') return undefined;
    let seen = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!seen) {
          seen = true;
          if (!entry.isIntersecting) setWaiting(true);
          return;
        }
        if (entry.isIntersecting) {
          setWaiting(false);
          setRun((value) => value + 1);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="ld-demo-col">
      <div
        key={run}
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
          <div className="ld-ink d-ink">x² − 4x + 3 = 0</div>
          <div className="ld-typed d-typed">
            <span className="ld-tag ld-tag-teal">Typed</span>
            <span className="ld-math">
              x<sup style={{ fontSize: 14 }}>2</sup> − 4x + 3 = 0
            </span>
          </div>
          <div className="ld-eqbar d-bar">
            <span className="ld-eqbtn is-on d-press">Find roots</span>
            <span className="ld-eqbtn">Plot</span>
            <span className="ld-eqbtn">d/dx</span>
          </div>
          <div className="ld-answer d-answer">
            <IconCheck />
            <span className="ld-mono">x = 1 &nbsp; or &nbsp; x = 3</span>
          </div>
        </div>
      </div>
      <button type="button" className="ld-replay" onClick={() => setRun((value) => value + 1)}>
        <IconReplay size={16} />
        Replay
      </button>
    </div>
  );
}
