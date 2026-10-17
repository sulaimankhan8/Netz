'use client';

import React, { useState, useMemo, memo } from 'react';
import { LuEye, LuEyeOff, LuX, LuPlus } from 'react-icons/lu';
import { FiAlertCircle } from 'react-icons/fi';
import { generateGraphDatasetFromLatex, CURVE_COLORS } from '../../utils/equationToGraph';
import { TOUCH_TARGET } from '../ui/Dialog';
import { Segmented } from '../ui/parts';

const RANGES = [
  { value: 2, label: '±2' },
  { value: 5, label: '±5' },
  { value: 10, label: '±10' },
  { value: 20, label: '±20' },
];

const EQUATION_PRESETS = [
  { label: 'sin x', expr: 'y = sin(x)' },
  { label: 'cos x', expr: 'y = cos(x)' },
  { label: 'x² − 4', expr: 'y = x^2 - 4' },
  { label: 'x³ − 3x', expr: 'y = x^3 - 3*x' },
  { label: 'eˣ', expr: 'y = exp(x)' },
  { label: '1/x', expr: 'y = 1/x' },
  { label: '|x|', expr: 'y = abs(x)' },
  { label: '√x', expr: 'y = sqrt(x)' },
];

// The plot is drawn in a 1000 x 1000 box stretched to the block; lines keep their width
const SIZE = 1000;
const stop = (e) => e.stopPropagation();

/** Round numbers for the axes: about `count` steps of 1, 2 or 5 times a power of ten. */
function niceTicks(min, max, count = 5) {
  const span = max - min;
  if (!(span > 0)) return [min];
  const raw = span / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * power).find((s) => span / s <= count + 1) || 10 * power;
  const ticks = [];
  for (let t = Math.ceil(min / step) * step; t <= max + step * 1e-9; t += step) ticks.push(Number(t.toFixed(10)));
  return ticks;
}

const formatTick = (v) => (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0) ? v.toExponential(0) : String(Number(v.toFixed(2))));

/** The y range the visible curves need, with a little room above and below. */
function yRangeOf(datasets) {
  let lo = Infinity;
  let hi = -Infinity;
  for (const ds of datasets) {
    if (ds.hidden) continue;
    for (const p of ds.data || []) {
      if (p.y === null || p.y === undefined) continue;
      if (p.y < lo) lo = p.y;
      if (p.y > hi) hi = p.y;
    }
  }
  if (!isFinite(lo)) return [-10, 10];
  if (hi - lo < 1e-6) return [lo - 1, hi + 1];
  const pad = (hi - lo) * 0.08;
  return [lo - pad, hi + pad];
}

/** One curve as an SVG path, broken where the function is undefined or jumps. */
function curvePath(data, [x0, x1], [y0, y1]) {
  let d = '';
  let pen = false;
  for (const p of data) {
    if (p.y === null || p.y === undefined) {
      pen = false;
      continue;
    }
    const x = ((p.x - x0) / (x1 - x0)) * SIZE;
    const y = ((y1 - p.y) / (y1 - y0)) * SIZE;
    d += `${pen ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    pen = true;
  }
  return d;
}

/**
 * A graph of one or more functions of x. Drawn as SVG (no canvas, no animation), so it stays
 * sharp at every zoom and costs nothing while the page pans; the curves are worked out again
 * only when an equation or the range changes. A mouse over the plot shows each curve's value.
 * Editing adds curves (typed, or one of the quick ones), removes them and sets the range.
 *
 * Memoized: panning and zooming the page do not draw it again.
 */
function GraphBlock({ block, onUpdateContent, isEditing: propIsEditing }) {
  const [range, setRange] = useState(10);
  const [input, setInput] = useState('');
  const [colour, setColour] = useState(null);
  const [formError, setFormError] = useState(null);
  const [hover, setHover] = useState(null); // index of the sample under the mouse
  const isEditing = Boolean(propIsEditing);
  const domain = useMemo(() => [-range, range], [range]);

  // The curves as stored, or a first example
  const rawDatasets = useMemo(() => {
    if (block.content?.graphData?.datasets !== undefined) return block.content.graphData.datasets;
    const first = generateGraphDatasetFromLatex('y = x^2 - 4x + 3', 'f(x) = x² - 4x + 3', domain, 0);
    return first ? [first] : [];
  }, [block.content?.graphData?.datasets, domain]);

  // Points for the current range
  const curves = useMemo(
    () =>
      rawDatasets
        .map((ds, idx) => {
          const source = ds.latex || ds.label || 'y = x^2 - 4';
          const fresh = generateGraphDatasetFromLatex(source, ds.label || source, domain, idx);
          if (!fresh) return ds;
          return {
            ...fresh,
            borderColor: ds.borderColor || fresh.borderColor,
            backgroundColor: ds.backgroundColor || fresh.backgroundColor,
            hidden: !!ds.hidden,
            // Which Equation block this curve follows (edits there update only this curve)
            ...(ds.sourceBlockId ? { sourceBlockId: ds.sourceBlockId } : {}),
          };
        })
        .filter(Boolean),
    [rawDatasets, domain]
  );

  const yRange = useMemo(() => yRangeOf(curves), [curves]);
  const paths = useMemo(() => curves.map((c) => (c.hidden ? '' : curvePath(c.data || [], domain, yRange))), [curves, domain, yRange]);
  const xTicks = useMemo(() => niceTicks(domain[0], domain[1], 6), [domain]);
  const yTicks = useMemo(() => niceTicks(yRange[0], yRange[1], 4), [yRange]);
  const px = (x) => ((x - domain[0]) / (domain[1] - domain[0])) * 100;
  const py = (y) => ((yRange[1] - y) / (yRange[1] - yRange[0])) * 100;

  const save = (datasets) => onUpdateContent?.(block.blockId, { graphData: { datasets } });

  const addCurve = (e, preset) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError(null);
    const expr = (typeof preset === 'string' ? preset : input).trim();
    if (!expr) return;
    const idx = curves.length;
    const chosen = colour || CURVE_COLORS[idx % CURVE_COLORS.length];
    const ds = generateGraphDatasetFromLatex(expr, expr, domain, idx);
    if (!ds) {
      setFormError('That could not be plotted. Try y = sin(x), x^2 - 4 or 2x + 1.');
      return;
    }
    ds.borderColor = chosen;
    ds.backgroundColor = `${chosen}15`;
    save([...curves, ds]);
    setInput('');
    setColour(null);
  };

  const toggleCurve = (i) => save(curves.map((c, j) => (j === i ? { ...c, hidden: !c.hidden } : c)));
  const removeCurve = (i) => save(curves.filter((_, j) => j !== i));

  // The value of each curve under the mouse
  const onPlotMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const samples = (curves[0] && curves[0].data && curves[0].data.length) || 0;
    if (samples > 1) setHover(Math.round(frac * (samples - 1)));
  };
  const hoverX = hover !== null && curves[0] && curves[0].data[hover] ? curves[0].data[hover].x : null;

  const chip = `h-8 ${TOUCH_TARGET} px-2.5 shrink-0 flex items-center rounded-lg text-pg-cap font-medium transition-colors`;

  return (
    <div className={`w-full h-full flex flex-col gap-2 ${isEditing ? '' : 'p-2.5'} select-none`}>
      {isEditing && (
        <div className="flex-shrink-0 flex flex-col gap-2" onPointerDown={stop}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-pg-cap font-semibold text-pg-text2">x from</span>
            <Segmented label="Range of x" value={range} onChange={setRange} options={RANGES} className="flex-1 max-w-[260px]" />
          </div>

          <form onSubmit={addCurve} className="flex items-center gap-1.5">
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pg-label font-semibold text-pg-text2 pointer-events-none">y =</span>
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="sin(x), x^2 - 4, 2x + 1"
                aria-label="Equation to plot"
                autoFocus
                className="w-full h-10 [@media(pointer:coarse)]:h-11 pl-10 pr-3 rounded-xl bg-pg-paper border border-pg-line font-mono text-pg-label text-pg-ink placeholder:text-pg-text2/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-pg-accent focus:border-pg-accent"
              />
            </div>
            <div role="group" aria-label="Curve colour" className="flex items-center gap-0.5 shrink-0">
              {CURVE_COLORS.slice(0, 4).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColour(colour === c ? null : c)}
                  aria-label={`Colour ${c}`}
                  aria-pressed={colour === c}
                  className={`w-7 h-7 ${TOUCH_TARGET} flex items-center justify-center rounded-full`}
                >
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c, boxShadow: colour === c ? '0 0 0 2px rgb(var(--pg-surface)), 0 0 0 3.5px rgb(var(--pg-ink))' : undefined }} />
                </button>
              ))}
            </div>
            <button type="submit" className={`h-10 ${TOUCH_TARGET} px-3.5 shrink-0 flex items-center gap-1 rounded-xl bg-pg-accent-fill text-white text-pg-label font-semibold hover:bg-pg-accent-fill/90`}>
              <LuPlus className="w-4 h-4" aria-hidden="true" />
              Plot
            </button>
          </form>

          <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
            {EQUATION_PRESETS.map((p) => (
              <button key={p.label} type="button" onClick={() => addCurve(null, p.expr)} title={`Plot ${p.expr}`} className={`${chip} bg-pg-plot-tint text-pg-plot hover:bg-pg-plot hover:text-pg-surface`}>
                {p.label}
              </button>
            ))}
          </div>

          {formError && (
            <div role="alert" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-pg-danger-tint text-pg-danger text-pg-cap">
              <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
              {formError}
            </div>
          )}
        </div>
      )}

      {/* The plot: y values on the left, x values underneath */}
      <div className="relative flex-1 min-h-[120px] pl-9 pb-5">
        <div className="absolute left-9 right-0 top-0 bottom-5 rounded-lg bg-pg-plot-tint/40 overflow-hidden" onPointerMove={onPlotMove} onPointerLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true" data-graph-plot>
            <g stroke="rgb(var(--pg-line))" strokeWidth="1" vectorEffect="non-scaling-stroke">
              {xTicks.map((t) => (
                <line key={`x${t}`} x1={px(t) * 10} x2={px(t) * 10} y1="0" y2={SIZE} vectorEffect="non-scaling-stroke" />
              ))}
              {yTicks.map((t) => (
                <line key={`y${t}`} y1={py(t) * 10} y2={py(t) * 10} x1="0" x2={SIZE} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
            <g stroke="rgb(var(--pg-text2))" strokeOpacity="0.55" strokeWidth="1.25">
              {domain[0] < 0 && domain[1] > 0 && <line x1={px(0) * 10} x2={px(0) * 10} y1="0" y2={SIZE} vectorEffect="non-scaling-stroke" />}
              {yRange[0] < 0 && yRange[1] > 0 && <line y1={py(0) * 10} y2={py(0) * 10} x1="0" x2={SIZE} vectorEffect="non-scaling-stroke" />}
            </g>
            {curves.map((c, i) =>
              paths[i] ? (
                <path key={i} d={paths[i]} fill="none" stroke={c.borderColor || CURVE_COLORS[i % CURVE_COLORS.length]} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              ) : null
            )}
            {hoverX !== null && <line x1={px(hoverX) * 10} x2={px(hoverX) * 10} y1="0" y2={SIZE} stroke="rgb(var(--pg-ink))" strokeOpacity="0.35" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />}
          </svg>
          {hoverX !== null && (
            <div className="absolute top-1.5 left-1.5 px-2 py-1 rounded-lg bg-pg-surface/95 border border-pg-line shadow-sm text-pg-cap tabular-nums text-pg-ink pointer-events-none">
              <div className="text-pg-text2">x = {formatTick(hoverX)}</div>
              {curves.map((c, i) => {
                const p = !c.hidden && c.data && c.data[hover];
                if (!p) return null;
                return (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.borderColor }} />
                    {p.y === null ? '—' : formatTick(p.y)}
                  </div>
                );
              })}
            </div>
          )}
          {curves.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-pg-label text-pg-text2">Nothing plotted yet. Edit to add an equation.</div>
          )}
        </div>
        {/* Axis labels, in strips that line up with the plot */}
        <div aria-hidden="true" className="absolute left-0 top-0 bottom-5 w-9">
          {yTicks.map((t) => (
            <span key={`yl${t}`} className="absolute right-1.5 text-pg-cap tabular-nums text-pg-text2 leading-none -translate-y-1/2" style={{ top: `${py(t)}%` }}>
              {formatTick(t)}
            </span>
          ))}
        </div>
        <div aria-hidden="true" className="absolute left-9 right-0 bottom-0 h-5">
          {xTicks.map((t) => (
            <span key={`xl${t}`} className="absolute bottom-0 text-pg-cap tabular-nums text-pg-text2 leading-none -translate-x-1/2" style={{ left: `${px(t)}%` }}>
              {formatTick(t)}
            </span>
          ))}
        </div>
      </div>

      {/* The curves: their colour, their equation, show or hide; remove while editing */}
      {curves.length > 0 && (
        <div className="flex-shrink-0 flex flex-wrap items-center gap-1.5" onPointerDown={stop}>
          {curves.map((c, i) => (
            <div key={i} className={`h-7 pl-2 pr-0.5 flex items-center gap-1.5 rounded-lg border border-pg-line text-pg-cap ${c.hidden ? 'text-pg-text2 bg-pg-paper' : 'text-pg-ink bg-pg-surface'}`}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.borderColor, opacity: c.hidden ? 0.35 : 1 }} />
              <span className={`max-w-[150px] truncate font-mono ${c.hidden ? 'line-through' : ''}`}>{c.label || c.latex || `Curve ${i + 1}`}</span>
              <button type="button" onClick={() => toggleCurve(i)} aria-label={c.hidden ? 'Show this curve' : 'Hide this curve'} title={c.hidden ? 'Show' : 'Hide'} className={`w-6 h-6 ${TOUCH_TARGET} flex items-center justify-center rounded-md text-pg-text2 hover:text-pg-ink hover:bg-pg-tray`}>
                {c.hidden ? <LuEyeOff className="w-3.5 h-3.5" /> : <LuEye className="w-3.5 h-3.5" />}
              </button>
              {isEditing && (
                <button type="button" onClick={() => removeCurve(i)} aria-label="Remove this curve" title="Remove" className={`w-6 h-6 ${TOUCH_TARGET} flex items-center justify-center rounded-md text-pg-text2 hover:text-pg-danger hover:bg-pg-tray`}>
                  <LuX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(GraphBlock);
