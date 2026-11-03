'use client';
// The interactive unit circle. Drag the point (touch, pen or mouse), use the arrow keys, or type an angle.
// The maths is in src/app/utils/engines/unit-circle.js.
import React, { useCallback, useRef, useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, StepsCard, Choice } from '@/app/components/method/Calculator';
import { at, solve, SPECIAL_ANGLES } from '@/app/utils/engines/unit-circle';

const SPECIAL = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
const fieldClass = 'w-full min-h-[44px] px-3 text-base font-mono font-bold rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 border-black/60 dark:border-neutral-600 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white';

// SVG coordinates rounded to 4 places: the server and the browser can differ in the last digit of sin/cos,
// which React reports as a hydration mismatch
const r4 = (v) => Math.round(v * 1e4) / 1e4;

/** A value as LaTeX: exact when we have it, else 4 decimal places. */
const valueTex = (exact, v) => exact ?? (v === null ? '\\text{undefined}' : sig(v, 5));

export default function UnitCircle() {
  const [deg, setDeg] = useState(60);
  const [text, setText] = useState('60');
  const [unit, setUnit] = useState('deg');
  const [snap, setSnap] = useState(true);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState(null); // set only when a drag ends or an angle is entered, so one drag counts once
  const svgRef = useRef(null);
  const dragging = useRef(false);
  useRecordSolve('unit-circle', 9, answer, () => ({ angle: answer?.deg }));

  const r = at(deg);
  const showDeg = (d) => { setDeg(d); setText(String(Math.round(d * 100) / 100)); setUnit('deg'); setError(''); };
  const commit = (d) => setAnswer({ deg: d, at: Date.now() });

  const angleFromPointer = useCallback((e) => {
    const box = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width * 2.8 - 1.4;
    const y = -((e.clientY - box.top) / box.height * 2.8 - 1.4);
    let d = (Math.atan2(y, x) * 180) / Math.PI;
    if (d < 0) d += 360;
    if (snap) {
      const near = [...SPECIAL, 360].reduce((best, s) => (Math.abs(s - d) < Math.abs(best - d) ? s : best), 0);
      d = Math.abs(near - d) <= 4 ? near % 360 : Math.round(d);
    } else d = Math.round(d * 10) / 10;
    return d;
  }, [snap]);

  const down = (e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); showDeg(angleFromPointer(e)); };
  const move = (e) => { if (dragging.current) showDeg(angleFromPointer(e)); };
  const up = (e) => { if (!dragging.current) return; dragging.current = false; const d = angleFromPointer(e); showDeg(d); commit(d); };
  const key = (e) => {
    const step = e.shiftKey ? 15 : 1;
    const k = { ArrowRight: -step, ArrowDown: -step, ArrowLeft: step, ArrowUp: step }[e.key];
    if (k === undefined) return;
    e.preventDefault();
    const d = (((deg + k) % 360) + 360) % 360;
    showDeg(d); commit(d);
  };

  const enter = () => {
    try {
      const s = solve({ angle: text, unit });
      setDeg(s.deg); setError(''); commit(s.deg);
    } catch (e) {
      setError(e.name === 'EngineError' ? e.message : 'Please enter an angle like 45 or pi/3.');
    }
  };

  const steps = (() => { try { return solve({ angle: String(deg), unit: 'deg' }).lines; } catch { return []; } })();
  const px = r4(r.cos), py = r4(-r.sin); // SVG y points down

  return (
    <div className="w-full space-y-6">
      <CalcCard title="Unit Circle Explorer">
        <ErrorBox>{error}</ErrorBox>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-6 items-start">
          <svg
            ref={svgRef}
            viewBox="-1.4 -1.4 2.8 2.8"
            className="w-full max-w-[380px] mx-auto h-auto touch-none select-none text-black dark:text-white cursor-pointer"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => { dragging.current = false; }}
            role="slider"
            tabIndex={0}
            aria-label="Angle on the unit circle. Drag, or use the arrow keys (Shift for 15° steps)."
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(deg)}
            aria-valuetext={`${sig(deg, 5)} degrees`}
            onKeyDown={key}
          >
            <line x1="-1.3" y1="0" x2="1.3" y2="0" stroke="currentColor" strokeWidth="0.01" opacity="0.5" />
            <line x1="0" y1="-1.3" x2="0" y2="1.3" stroke="currentColor" strokeWidth="0.01" opacity="0.5" />
            <circle cx="0" cy="0" r="1" fill="rgba(251, 174, 61, 0.12)" stroke="currentColor" strokeWidth="0.018" />
            {SPECIAL.map((s) => {
              const c = Math.cos((s * Math.PI) / 180), sn = Math.sin((s * Math.PI) / 180);
              return (
                <g key={s}>
                  <circle cx={r4(c)} cy={r4(-sn)} r="0.022" fill="currentColor" opacity="0.6" />
                  <text x={r4(c * 1.17)} y={r4(-sn * 1.17)} fontSize="0.08" textAnchor="middle" dominantBaseline="middle" fill="currentColor" opacity="0.75" fontFamily="ui-monospace, monospace">{s}°</text>
                </g>
              );
            })}
            {/* angle arc */}
            {deg > 0.5 && (
              <path d={`M 0.22 0 A 0.22 0.22 0 ${r.t > 180 ? 1 : 0} 0 ${0.22 * px} ${0.22 * py}`} fill="none" stroke="#C2632A" strokeWidth="0.015" />
            )}
            {/* cos (horizontal) and sin (vertical) legs */}
            <line x1="0" y1="0" x2={px} y2="0" stroke="#2B4570" strokeWidth="0.03" className="dark:stroke-sky-400" />
            <line x1={px} y1="0" x2={px} y2={py} stroke="#D55E64" strokeWidth="0.03" />
            <line x1="0" y1="0" x2={px} y2={py} stroke="currentColor" strokeWidth="0.022" />
            <circle cx={px} cy={py} r="0.075" fill="#FFE600" stroke="black" strokeWidth="0.018" />
            <text x={px / 2} y={0.11} fontSize="0.085" textAnchor="middle" fill="currentColor" fontFamily="serif" fontStyle="italic">cos</text>
            <text x={px + (px >= 0 ? 0.04 : -0.04)} y={py / 2} fontSize="0.085" textAnchor={px >= 0 ? 'start' : 'end'} fill="#D55E64" fontFamily="serif" fontStyle="italic">sin</text>
          </svg>

          <div className="space-y-4 min-w-0">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-end">
              <label className="space-y-1 min-w-0">
                <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 block">Angle θ</span>
                <input type="text" autoComplete="off" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') enter(); }} className={fieldClass} placeholder="45 or pi/3" />
              </label>
              <EditorialButton variant="primary" size="md" onClick={enter}><FiCheckCircle className="w-4 h-4 mr-1" /> Go</EditorialButton>
            </div>
            <Choice label="Typed angle is in" value={unit} onChange={setUnit} options={[{ value: 'deg', label: 'Degrees' }, { value: 'rad', label: 'Radians' }]} />
            <label className="flex items-center gap-2 text-sm font-mono min-h-[44px] text-black dark:text-white">
              <input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} className="w-5 h-5" />
              Snap to special angles while dragging
            </label>

            <div className="p-4 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-1 text-black dark:text-white overflow-x-auto">
              <BlockMath math={`\\theta = ${sig(deg, 6)}^\\circ = ${r.radTex ?? `${sig(r.radians, 5)}`}\\ \\text{rad}`} />
              <BlockMath math={`\\sin\\theta = ${valueTex(r.exact?.sin, r.sin)}, \\quad \\cos\\theta = ${valueTex(r.exact?.cos, r.cos)}`} />
              <BlockMath math={`\\tan\\theta = ${r.tanUndefined ? '\\text{undefined}' : valueTex(r.exact?.tan, r.tan)}`} />
              <p className="text-sm font-mono text-center">
                {r.quadrant ? `Quadrant ${['', 'I', 'II', 'III', 'IV'][r.quadrant]} · reference angle ${sig(r.ref, 5)}° · positive here: ${r.positive}` : `On the ${r.axis}`}
              </p>
            </div>
          </div>
        </div>
      </CalcCard>

      <StepsCard title="Working for this angle">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
          {steps.map((l, i) => <BlockMath key={i} math={l} />)}
          <BlockMath math={`(\\cos\\theta, \\sin\\theta) = \\left(${valueTex(r.exact?.cos, r.cos)},\\ ${valueTex(r.exact?.sin, r.sin)}\\right)`} />
        </div>
      </StepsCard>

      <StepsCard title="Special Angles Table">
        <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
          <table className="w-full text-center text-sm border-collapse text-black dark:text-white">
            <thead>
              <tr className="bg-neutral-200 dark:bg-neutral-900 font-bold font-mono text-xs">
                <th className="p-2.5">Degrees</th><th className="p-2.5">Radians</th><th className="p-2.5">sin θ</th><th className="p-2.5">cos θ</th><th className="p-2.5">tan θ</th>
              </tr>
            </thead>
            <tbody>
              {SPECIAL_ANGLES.map((s) => (
                <tr key={s.d} onClick={() => { showDeg(s.d % 360); commit(s.d % 360); }} className={`border-t border-black/15 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 ${s.d % 360 === r.t && Number.isInteger(deg) ? 'bg-[#FFE600]/20 dark:bg-amber-950/40' : ''}`}>
                  <td className="p-2 font-mono font-bold">{s.d}°</td>
                  <td className="p-2"><InlineMath math={s.radTex} /></td>
                  <td className="p-2"><InlineMath math={s.exact.sin} /></td>
                  <td className="p-2"><InlineMath math={s.exact.cos} /></td>
                  <td className="p-2"><InlineMath math={s.exact.tan ?? '\\text{undefined}'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StepsCard>
    </div>
  );
}
