'use client';

import { useEffect, useRef, useState } from 'react';
import { IconCheck, IconDownload, IconGraph, IconSteps, IconTable } from './icons';

const BASE_Z = { graph: 2, export: 1, steps: 3, table: 2 };
// y = 2x² − 3x + 1 for x from −0.5 to 2: 72 px per unit across, 22 px per unit up, x axis at 90
const CURVE = 'M5.5 24 Q95.5 161.5 185.5 24';
const SPARK = 'M10 44 L70 32 L130 20 L190 8';

/**
 * "Everything a method gives you": Graph, Export, Steps and Tables cards over the original
 * background, inspired by the old hero. Each card keeps a small loop going (a point tracing the
 * curve, exports cycling through PNG, PDF and Markdown, steps writing themselves, a column sweep
 * through the table) and the cards drift gently. The pile spreads as the section scrolls in.
 * Loops pause while the section is off screen, and "reduce motion" keeps everything still.
 * Tapping a card's header brings it to the front. Under 700 px the cards become a swipe row.
 */
export default function FloatingCards() {
  const [front, setFront] = useState('steps');
  const [motion, setMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const stageRef = useRef(null);

  useEffect(() => {
    setMotion(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting), { rootMargin: '80px' });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    stageRef.current?.querySelectorAll('svg').forEach((svg) => {
      if (paused) svg.pauseAnimations?.();
      else svg.unpauseAnimations?.();
    });
  }, [paused, motion]);

  const card = (id) => ({
    className: `ld-fc ld-fc-${id}`,
    style: { '--z': front === id ? 10 : BASE_Z[id] },
  });
  const head = (id, label, Icon, meta) => (
    <button type="button" className="ld-fc-head" onClick={() => setFront(id)} aria-pressed={front === id}>
      <span className="ld-fc-icon"><Icon size={16} /></span>
      <span className="ld-fc-label">{label}</span>
      {meta && <span className="ld-fc-meta">{meta}</span>}
    </button>
  );

  return (
    <div ref={stageRef} className={`ld-stage${paused ? ' is-paused' : ''}`} role="group" aria-label="What a method gives you">
      <div {...card('graph')}>
        {head('graph', 'Graph', IconGraph, 'live')}
        <div className="ld-fc-body">
          <span className="ld-math ld-fc-eq">
            y = 2x<sup>2</sup> − 3x + 1
          </span>
          <svg className="ld-fc-plot" viewBox="0 0 208 120" role="img" aria-label="Parabola crossing the x axis at 0.5 and 1">
            <g className="ld-fc-grid" aria-hidden="true">
              <path d="M0 30 H208 M0 60 H208 M0 90 H208 M52 0 V120 M104 0 V120 M156 0 V120" />
            </g>
            <path d="M6 90 H202" className="ld-fc-axis" />
            <path d="M41.5 4 V116" className="ld-fc-axis" />
            <path d={CURVE} className="ld-fc-curve" pathLength="1" />
            <circle cx="77.5" cy="90" r="9" className="ld-fc-ring" />
            <circle cx="113.5" cy="90" r="9" className="ld-fc-ring ld-fc-ring-2" />
            <circle cx="77.5" cy="90" r="4.5" className="ld-fc-root" />
            <circle cx="113.5" cy="90" r="4.5" className="ld-fc-root" />
            {motion && (
              <circle r="6" className="ld-fc-tracer">
                <animateMotion dur="6s" repeatCount="indefinite" path={CURVE} keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
              </circle>
            )}
          </svg>
          <span className="ld-fc-note">Roots at x = 0.5 and x = 1</span>
        </div>
      </div>

      <div {...card('export')}>
        {head('export', 'Export', IconDownload)}
        <div className="ld-fc-body">
          <div className="ld-fc-chips" aria-hidden="true">
            <span className="ld-fc-chip ld-fc-cycle-1">PNG</span>
            <span className="ld-fc-chip ld-fc-cycle-2">PDF</span>
            <span className="ld-fc-chip ld-fc-cycle-3">Markdown</span>
          </div>
          <div className="ld-fc-files">
            {[
              ['gauss-seidel-steps.png', 1],
              ['gauss-seidel-steps.pdf', 2],
              ['gauss-seidel-steps.md', 3],
            ].map(([name, n]) => (
              <div key={name} className={`ld-fc-file ld-fc-cycle-${n}`}>
                <span className="ld-fc-thumb" aria-hidden="true"><span /><span /><span /></span>
                <span className="ld-fc-file-text">
                  <span className="ld-mono ld-fc-file-name">{name}</span>
                  <span className="ld-fc-progress" aria-hidden="true"><span /></span>
                  <span className="ld-fc-saved"><IconCheck size={13} />Saved</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div {...card('steps')}>
        {head('steps', 'Steps', IconSteps, '4 steps')}
        <div className="ld-fc-body">
          <span className="ld-math ld-fc-eq">
            x<sup>3</sup> − 4x<sup>2</sup> + 5x − 2 = 0
          </span>
          <ol className="ld-fc-steplist">
            <li className="ld-fc-step-1"><span className="ld-mono">1</span>Try x = 1: 1 − 4 + 5 − 2 = 0</li>
            <li className="ld-fc-step-2"><span className="ld-mono">2</span>Divide: (x − 1)(x² − 3x + 2)</li>
            <li className="ld-fc-step-3"><span className="ld-mono">3</span>Factor: (x − 1)²(x − 2)</li>
            <li className="ld-fc-step-4 is-answer"><span className="ld-mono">4</span>Roots: x = 1 (twice), x = 2</li>
          </ol>
        </div>
      </div>

      <div {...card('table')}>
        {head('table', 'Table', IconTable)}
        <div className="ld-fc-body">
          <span className="ld-math ld-fc-eq">y = 3x + 2</span>
          <table className="ld-mono ld-fc-grid-table">
            <tbody>
              <tr>
                <th scope="row">x</th>
                <td className="ld-fc-col-1">0</td><td className="ld-fc-col-2">1</td><td className="ld-fc-col-3">2</td><td className="ld-fc-col-4">3</td>
              </tr>
              <tr>
                <th scope="row">y</th>
                <td className="ld-fc-col-1">2</td><td className="ld-fc-col-2">5</td><td className="ld-fc-col-3">8</td><td className="ld-fc-col-4">11</td>
              </tr>
            </tbody>
          </table>
          <svg className="ld-fc-spark" viewBox="0 0 200 52" aria-hidden="true">
            <path d={SPARK} className="ld-fc-spark-line" />
            <circle cx="10" cy="44" r="3.5" className="ld-fc-spark-dot" />
            <circle cx="70" cy="32" r="3.5" className="ld-fc-spark-dot" />
            <circle cx="130" cy="20" r="3.5" className="ld-fc-spark-dot" />
            <circle cx="190" cy="8" r="3.5" className="ld-fc-spark-dot" />
            {motion && (
              <circle r="5.5" className="ld-fc-spark-tracer">
                <animateMotion dur="4s" repeatCount="indefinite" path={SPARK} keyPoints="0;0;0.333;0.333;0.667;0.667;1;1" keyTimes="0;0.15;0.25;0.4;0.5;0.65;0.75;1" calcMode="linear" />
              </circle>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
