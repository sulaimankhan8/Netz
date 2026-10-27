'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import SHOTS from './guideShots.json';
import { IconArrow } from './icons';

const STEP_MS = 7000;
const SPOT_MS = 1700;

/*
 * "Every step, shown": a guided look at a real method page (Gauss–Seidel), one step at a time,
 * like the old landing page's step guide. Each step is a screenshot of the page with numbered pins.
 * The screenshots and pin positions come from tests/browser/capture-guide.mjs (light and dark).
 */
const STEPS = [
  {
    id: 'idea',
    title: 'The idea',
    text: 'Every method starts with what it does and when you would use it.',
    pins: { title: 'Method and unit', idea: 'What it does' },
  },
  {
    id: 'formula',
    title: 'The formula',
    text: 'The system you solve, the condition that makes it work, and the rules to remember.',
    pins: { system: 'The system', condition: 'When it converges', rules: 'Rules to remember' },
  },
  {
    id: 'procedure',
    title: 'Procedure and example',
    text: 'The method one step at a time, then a full example worked by hand.',
    pins: { heading: 'Step-by-step procedure', example: 'Worked example' },
  },
  {
    id: 'calculator',
    title: 'Try your own numbers',
    text: 'Type a system, or press Quick Demo for an example, then Solve.',
    pins: { demo: 'Fill in an example', inputs: 'Your coefficients', solve: 'Solve', answer: 'Answer, ready to export' },
  },
  {
    id: 'table',
    title: 'Every iteration',
    text: 'The table shows x, y and z after each pass, until they stop changing.',
    pins: { tabs: 'Switch views', rows: 'One row per pass', last: 'Converged values' },
  },
  {
    id: 'graph',
    title: 'Watch it converge',
    text: 'The graph shows each value settling. Export it as a picture for your notes.',
    pins: { plot: 'Values settling', export: 'Export as PNG' },
  },
];

// Phones show the method page as a phone shows it (capture-guide.mjs with PHONE=1), when those shots exist
function shotFor(step, phone) {
  const shots = SHOTS[step.id];
  return phone && shots?.phone ? shots.phone : shots;
}

function pinsFor(step, phone) {
  return (shotFor(step, phone)?.pins || [])
    .filter((pin) => !pin.missing && step.pins[pin.id] && pin.x >= 0 && pin.x <= 100 && pin.y >= 0 && pin.y <= 100)
    .map((pin, index) => ({ ...pin, n: index + 1, label: step.pins[pin.id] }));
}

export default function MethodGuide() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hold, setHold] = useState(false);
  const [visible, setVisible] = useState(false);
  const [spot, setSpot] = useState(0);
  const [motion, setMotion] = useState(true);
  const [phone, setPhone] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 600px)');
    const update = () => setPhone(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAuto(false);
      setMotion(false);
    }
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const running = auto && visible && !hold;

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setTimeout(() => setActive((value) => (value + 1) % STEPS.length), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [running, active]);

  // One label at a time, moving from pin to pin, so the labels never pile up on the picture
  useEffect(() => {
    setSpot(0);
  }, [active]);

  useEffect(() => {
    if (!visible || !motion || hold) return undefined;
    const timer = window.setInterval(() => setSpot((value) => value + 1), SPOT_MS);
    return () => window.clearInterval(timer);
  }, [visible, motion, hold, active]);

  // Fetch the next screenshot early so the change is instant
  useEffect(() => {
    const next = shotFor(STEPS[(active + 1) % STEPS.length], phone);
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    if (next?.[theme]) new window.Image().src = next[theme].src;
  }, [active, phone]);

  const pick = useCallback((index) => {
    setAuto(false);
    setActive((index + STEPS.length) % STEPS.length);
  }, []);

  const step = STEPS[active];
  const shot = shotFor(step, phone);
  const pins = pinsFor(step, phone);
  const spotIndex = pins.length ? spot % pins.length : -1;

  return (
    <div
      ref={rootRef}
      className={`ld-guide${running ? '' : ' is-held'}`}
      onPointerEnter={() => setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
    >
      <ol className="ld-guide-steps" aria-label="Steps">
        {STEPS.map((s, index) => (
          <li key={s.id}>
            <button
              type="button"
              className="ld-guide-step"
              aria-current={index === active ? 'step' : undefined}
              onClick={() => pick(index)}
            >
              <span className="ld-guide-num ld-mono">{index + 1}</span>
              <span className="ld-guide-step-text">
                <span className="ld-guide-step-title">{s.title}</span>
                <span className="ld-guide-step-body">{s.text}</span>
                {index === active && (
                  <span className="ld-guide-step-pins">
                    {pins.map((pin, i) => (
                      <span
                        key={pin.id}
                        className={`ld-guide-step-pin${i === spotIndex ? ' is-spot' : ''}`}
                        onPointerEnter={() => setSpot(i)}
                      >
                        <span className="ld-pin-dot ld-mono">{pin.n}</span>
                        {pin.label}
                      </span>
                    ))}
                  </span>
                )}
              </span>
              {index === active && auto && <span key={`bar-${active}`} className="ld-guide-bar" aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ol>

      <div className="ld-guide-main">
        <figure className="ld-browser">
          <div className="ld-browser-bar" aria-hidden="true">
            <span className="ld-browser-dots"><span /><span /><span /></span>
            <span className="ld-browser-url ld-mono">netz-ruby.vercel.app/Gauss-seidal</span>
          </div>
          <div className="ld-browser-view">
            <div key={step.id} className="ld-shot" style={{ '--ar': shot.light.width / shot.light.height }}>
              <img
                className="ld-shot-light"
                src={shot.light.src}
                width={shot.light.width}
                height={shot.light.height}
                alt={`Gauss–Seidel page: ${step.title}`}
                decoding="async"
              />
              <img
                className="ld-shot-dark"
                src={shot.dark.src}
                width={shot.dark.width}
                height={shot.dark.height}
                alt=""
                decoding="async"
              />
              {pins.map((pin, i) => (
                <span
                  key={pin.id}
                  className={`ld-pin${pin.x > 58 ? ' is-left' : ''}${i === spotIndex ? ' is-spot' : ''}`}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%`, '--i': pin.n }}
                  aria-hidden="true"
                >
                  <span className="ld-pin-dot ld-mono">{pin.n}</span>
                  <span className="ld-pin-label">{pin.label}</span>
                </span>
              ))}
            </div>
          </div>
          <figcaption className="ld-guide-caption">
            {/* Phones: where you are in the six steps */}
            <span className="ld-guide-progress" aria-hidden="true">
              {STEPS.map((s, index) => (
                <span key={s.id} className={index <= active ? 'is-on' : ''} />
              ))}
            </span>
            <span className="ld-guide-caption-kicker ld-mono">
              Step {active + 1} of {STEPS.length}
            </span>
            <span className="ld-guide-caption-title">
              <span className="ld-guide-caption-n">{active + 1}. </span>
              {step.title}
            </span>
            <span className="ld-guide-caption-text">{step.text}</span>
            <ol className="ld-guide-legend">
              {pins.map((pin, i) => (
                <li key={pin.id} className={i === spotIndex ? 'is-spot' : ''}>
                  <span className="ld-pin-dot ld-mono">{pin.n}</span>
                  {pin.label}
                </li>
              ))}
            </ol>
          </figcaption>
        </figure>

        <div className="ld-guide-nav">
          <button type="button" className="ld-btn ld-btn-secondary ld-btn-sm" onClick={() => pick(active - 1)} aria-label="Previous step">
            <span aria-hidden="true">←</span> Back
          </button>
          <span className="ld-guide-count ld-mono" aria-live="polite">
            {active + 1} / {STEPS.length}
          </span>
          <button type="button" className="ld-btn ld-btn-secondary ld-btn-sm" onClick={() => pick(active + 1)} aria-label="Next step">
            Next <span aria-hidden="true">→</span>
          </button>
          <Link href="/Gauss-seidal" className="ld-btn ld-btn-main ld-btn-sm ld-guide-open">
            Open Gauss–Seidel
            <IconArrow size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
