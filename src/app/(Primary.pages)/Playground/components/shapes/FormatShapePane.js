'use client';

import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import ColorPicker from './ColorPicker';
import { LINE_DASHES, isLineShape, hasFill, hasOutline } from '../../utils/shapes/shapeModel';
import { SHADOW_PRESETS, resolveShadow } from '../../utils/shapes/shapeStyles';
import { FONT_CHOICES, DEFAULT_INSETS } from '../../utils/shapes/shapeText';

const TABS = [
  { id: 'fill', label: 'Fill & Line' },
  { id: 'effects', label: 'Effects' },
  { id: 'size', label: 'Size & Properties' },
  { id: 'text', label: 'Text' },
];
const ARROWS = [['none', 'None'], ['triangle', 'Arrow'], ['arrow', 'Open Arrow'], ['stealth', 'Stealth Arrow'], ['diamond', 'Diamond Arrow'], ['oval', 'Oval Arrow']];

const round1 = (n) => Math.round(n * 10) / 10;

function Row({ label, children }) {
  return (
    <label className="flex items-center gap-2 min-h-[36px]">
      <span className="w-28 shrink-0 text-pg-text2">{label}</span>
      <span className="flex-1 flex items-center gap-2 min-w-0">{children}</span>
    </label>
  );
}

function NumberField({ value, onChange, min, max, step = 1, suffix, label }) {
  return (
    <span className="flex items-center gap-1">
      <input
        type="number"
        value={Number.isFinite(value) ? round1(value) : ''}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (e.target.value !== '' && Number.isFinite(v)) onChange(min !== undefined ? Math.max(min, max !== undefined ? Math.min(max, v) : v) : v);
        }}
        className="w-20 h-8 px-2 rounded-lg bg-pg-tray border border-pg-line tabular-nums"
      />
      {suffix && <span className="text-pg-text2">{suffix}</span>}
    </span>
  );
}

function Slider({ value, onChange, min = 0, max = 100, label, suffix = '%' }) {
  return (
    <>
      <input type="range" min={min} max={max} value={Math.round(value)} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-[rgb(var(--pg-ink))]" aria-label={label} />
      <span className="w-10 text-right tabular-nums">{Math.round(value)}{suffix}</span>
    </>
  );
}

function Choice({ options, value, onChange, label }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className="flex-1 min-w-0 h-8 px-2 rounded-lg bg-pg-tray border border-pg-line">
      {options.map(([id, text]) => (
        <option key={id} value={id}>{text}</option>
      ))}
    </select>
  );
}

/** A colour swatch that opens the Office colour menu under it. */
function ColorButton({ value, onPick, coarse, label }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="flex-1 flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={label}
        aria-expanded={open}
        className="h-8 flex items-center gap-2 px-2 rounded-lg bg-pg-tray border border-pg-line text-left"
      >
        <span className="w-6 h-4 rounded-sm border border-black/10" style={{ backgroundColor: value || 'transparent' }} />
        <span className="tabular-nums">{value || 'None'}</span>
      </button>
      {open && (
        <ColorPicker
          current={value}
          coarse={coarse}
          onPick={(hex) => {
            onPick(hex);
            setOpen(false);
          }}
        />
      )}
    </span>
  );
}

/**
 * The Format Shape pane (WPS: Property pane), with every setting in one place:
 * Fill & Line, Effects, Size & Properties, Text. A side panel on wider screens, a bottom sheet on phones.
 */
export default function FormatShapePane({ shape, initialTab = 'fill', isMobile, coarse, onStyle, onUpdate, onClose }) {
  const [tab, setTab] = useState(initialTab);
  // Opening the pane from a menu (Shadow Options, More Rotation Options) shows that tab
  useEffect(() => setTab(initialTab), [initialTab]);

  // Escape closes the pane (not the shape selection as well); a text field keeps Escape for itself
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== 'Escape' || (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName))) return;
      e.stopImmediatePropagation();
      onClose();
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [onClose]);
  if (!shape) return null;
  const line = shape.line || {};
  const fill = shape.fill || {};
  const text = shape.text || {};
  const lineShape = isLineShape(shape);
  const shadow = resolveShadow(shape.shadow);
  const fillKind = !hasFill(shape) ? 'none' : fill.type === 'gradient' ? 'gradient' : 'solid';

  const setShadow = (patch) => onUpdate((s) => ({ ...s, shadow: patch === null ? null : { ...(s.shadow || { preset: 'outerBottomRight' }), ...patch } }));
  const setText = (patch) => onStyle({ text: patch });

  return (
    <aside
      role="dialog"
      aria-label="Format Shape"
      data-format-pane
      onPointerDown={(e) => e.stopPropagation()}
      className={`${
        isMobile ? 'fixed bottom-0 left-0 right-0 h-[60vh] rounded-t-3xl border-t' : 'fixed right-3 top-20 bottom-24 w-[340px] rounded-2xl border'
      } z-[60] flex flex-col bg-pg-surface backdrop-blur-2xl border-pg-line shadow-2xl text-xs text-pg-ink`}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="font-bold text-sm">Format Shape</span>
        <button type="button" onClick={onClose} aria-label="Close Format Shape" className="w-8 h-8 flex items-center justify-center rounded-lg text-pg-text2 hover:bg-pg-tray">
          <FiX className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-1 px-3 pb-2 border-b border-pg-line overflow-x-auto" role="tablist">
        {TABS.filter((t) => !(lineShape && t.id === 'text')).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-2.5 h-8 rounded-lg font-semibold whitespace-nowrap ${tab === t.id ? 'bg-pg-ink text-pg-on-ink' : 'hover:bg-pg-tray'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 flex flex-col gap-2">
        {tab === 'fill' && (
          <>
            {!lineShape && (
              <>
                <div className="font-bold text-pg-cap uppercase tracking-wide text-pg-text2">Fill</div>
                <Row label="Fill">
                  <Choice
                    label="Fill type"
                    value={fillKind}
                    options={[['none', 'No fill'], ['solid', 'Solid fill'], ['gradient', 'Gradient fill']]}
                    onChange={(kind) => {
                      if (kind === 'none') onStyle({ fill: { type: 'none' } });
                      else if (kind === 'solid') onStyle({ fill: { type: 'solid', color: fill.color || '#4472C4' } });
                      else onStyle({ fill: { type: 'gradient', color: fill.color || '#4472C4', stops: fill.stops || ['#FFFFFF', fill.color || '#4472C4'], angle: fill.angle ?? 90 } });
                    }}
                  />
                </Row>
                {fillKind === 'solid' && (
                  <Row label="Color">
                    <ColorButton label="Fill color" value={fill.color} coarse={coarse} onPick={(hex) => onStyle({ fill: { type: 'solid', color: hex } })} />
                  </Row>
                )}
                {fillKind === 'gradient' && (
                  <>
                    <Row label="Start color">
                      <ColorButton label="Gradient start color" value={fill.stops[0]} coarse={coarse} onPick={(hex) => onStyle({ fill: { stops: [hex, fill.stops[1]] } })} />
                    </Row>
                    <Row label="End color">
                      <ColorButton label="Gradient end color" value={fill.stops[1]} coarse={coarse} onPick={(hex) => onStyle({ fill: { stops: [fill.stops[0], hex], color: hex } })} />
                    </Row>
                    <Row label="Angle">
                      <Slider label="Gradient angle" min={0} max={359} suffix="°" value={fill.angle ?? 90} onChange={(v) => onStyle({ fill: { angle: v } })} />
                    </Row>
                  </>
                )}
                {fillKind !== 'none' && (
                  <Row label="Transparency">
                    <Slider label="Fill transparency" value={(1 - (fill.alpha ?? 1)) * 100} onChange={(v) => onStyle({ fill: { alpha: 1 - v / 100 } })} />
                  </Row>
                )}
              </>
            )}

            <div className="font-bold text-pg-cap uppercase tracking-wide text-pg-text2 mt-2">Line</div>
            <Row label="Line">
              <Choice
                label="Line type"
                value={hasOutline(shape) ? 'solid' : 'none'}
                options={[['none', 'No line'], ['solid', 'Solid line']]}
                onChange={(kind) => onStyle({ line: kind === 'none' ? { type: 'none' } : { type: 'solid', color: line.color || '#2F528F', width: line.width || 1.33 } })}
              />
            </Row>
            {hasOutline(shape) && (
              <>
                <Row label="Color">
                  <ColorButton label="Line color" value={line.color} coarse={coarse} onPick={(hex) => onStyle({ line: { color: hex } })} />
                </Row>
                <Row label="Transparency">
                  <Slider label="Line transparency" value={(1 - (line.alpha ?? 1)) * 100} onChange={(v) => onStyle({ line: { alpha: 1 - v / 100 } })} />
                </Row>
                <Row label="Width">
                  <NumberField label="Line width" value={line.width * 0.75} min={0.25} max={100} step={0.25} suffix="pt" onChange={(pt) => onStyle({ line: { width: (pt * 4) / 3 } })} />
                </Row>
                <Row label="Dash type">
                  <Choice label="Dash type" value={line.dash || 'solid'} options={LINE_DASHES.map((d) => [d.id, d.label])} onChange={(dash) => onStyle({ line: { dash } })} />
                </Row>
                {lineShape && (
                  <>
                    <Row label="Begin arrow">
                      <Choice label="Begin arrow" value={(line.head && line.head.type) || 'none'} options={ARROWS} onChange={(type) => onStyle({ line: { head: type === 'none' ? { type } : { type, w: 'med', len: 'med' } } })} />
                    </Row>
                    <Row label="End arrow">
                      <Choice label="End arrow" value={(line.tail && line.tail.type) || 'none'} options={ARROWS} onChange={(type) => onStyle({ line: { tail: type === 'none' ? { type } : { type, w: 'med', len: 'med' } } })} />
                    </Row>
                  </>
                )}
              </>
            )}
          </>
        )}

        {tab === 'effects' && (
          <>
            <div className="font-bold text-pg-cap uppercase tracking-wide text-pg-text2">Shadow</div>
            <Row label="Presets">
              <Choice label="Shadow preset" value={shadow ? shadow.id : 'none'} options={[['none', 'No Shadow'], ...SHADOW_PRESETS.map((p) => [p.id, p.label])]} onChange={(id) => onUpdate((s) => ({ ...s, shadow: id === 'none' ? null : { preset: id, ...(s.shadow && s.shadow.color ? { color: s.shadow.color, alpha: s.shadow.alpha } : {}) } }))} />
            </Row>
            {shadow && (
              <>
                <Row label="Color">
                  <ColorButton label="Shadow color" value={shadow.color} coarse={coarse} onPick={(hex) => setShadow({ color: hex })} />
                </Row>
                <Row label="Transparency">
                  <Slider label="Shadow transparency" value={(1 - shadow.alpha) * 100} onChange={(v) => setShadow({ alpha: 1 - v / 100 })} />
                </Row>
                <Row label="Blur">
                  <NumberField label="Shadow blur" value={shadow.blur * 0.75} min={0} max={100} step={0.5} suffix="pt" onChange={(pt) => setShadow({ blur: (pt * 4) / 3 })} />
                </Row>
                <Row label="Angle">
                  <Slider label="Shadow angle" min={0} max={359} suffix="°" value={shadow.angle} onChange={(v) => setShadow({ angle: v })} />
                </Row>
                <Row label="Distance">
                  <NumberField label="Shadow distance" value={shadow.dist * 0.75} min={0} max={200} step={0.5} suffix="pt" onChange={(pt) => setShadow({ dist: (pt * 4) / 3 })} />
                </Row>
              </>
            )}
          </>
        )}

        {tab === 'size' && (
          <>
            <div className="font-bold text-pg-cap uppercase tracking-wide text-pg-text2">Size</div>
            <Row label="Height">
              <NumberField label="Height" value={shape.h} min={0} step={1} suffix="px" onChange={(h) => onUpdate((s) => ({ ...s, h, ...(s.lockRatio && s.h > 0 ? { w: (s.w * h) / s.h } : {}) }))} />
            </Row>
            <Row label="Width">
              <NumberField label="Width" value={shape.w} min={0} step={1} suffix="px" onChange={(w) => onUpdate((s) => ({ ...s, w, ...(s.lockRatio && s.w > 0 ? { h: (s.h * w) / s.w } : {}) }))} />
            </Row>
            <Row label="Rotation">
              <NumberField label="Rotation" value={shape.rot || 0} min={-360} max={360} step={1} suffix="°" onChange={(deg) => onUpdate((s) => ({ ...s, rot: ((deg % 360) + 360) % 360 }))} />
            </Row>
            <Row label="Lock aspect ratio">
              <input type="checkbox" checked={Boolean(shape.lockRatio)} onChange={(e) => onUpdate((s) => ({ ...s, lockRatio: e.target.checked }))} className="w-4 h-4 accent-[rgb(var(--pg-accent-fill))]" aria-label="Lock aspect ratio" />
            </Row>
            <div className="font-bold text-pg-cap uppercase tracking-wide text-pg-text2 mt-2">Position</div>
            <Row label="Horizontal">
              <NumberField label="Horizontal position" value={shape.x} step={1} suffix="px" onChange={(x) => onUpdate((s) => ({ ...s, x }))} />
            </Row>
            <Row label="Vertical">
              <NumberField label="Vertical position" value={shape.y} step={1} suffix="px" onChange={(y) => onUpdate((s) => ({ ...s, y }))} />
            </Row>
          </>
        )}

        {tab === 'text' && !lineShape && (
          <>
            <div className="font-bold text-pg-cap uppercase tracking-wide text-pg-text2">Font</div>
            <Row label="Font">
              <Choice label="Font" value={text.font || 'sans'} options={FONT_CHOICES.map((f) => [f.id, f.label])} onChange={(font) => setText({ font })} />
            </Row>
            <Row label="Size">
              <NumberField label="Font size" value={(text.size || 16) * 0.75} min={4} max={400} step={0.5} suffix="pt" onChange={(pt) => setText({ size: (pt * 4) / 3 })} />
            </Row>
            <Row label="Style">
              {[['bold', 'B', 'Bold'], ['italic', 'I', 'Italic'], ['underline', 'U', 'Underline']].map(([key, mark, name]) => (
                <button
                  key={key}
                  type="button"
                  aria-label={name}
                  aria-pressed={Boolean(text[key])}
                  onClick={() => setText({ [key]: !text[key] })}
                  className={`w-8 h-8 rounded-lg border ${text[key] ? 'bg-pg-ink text-pg-on-ink border-pg-ink' : 'border-pg-line'} ${key === 'bold' ? 'font-bold' : key === 'italic' ? 'italic' : 'underline'}`}
                >
                  {mark}
                </button>
              ))}
            </Row>
            <Row label="Color">
              <ColorButton label="Text color" value={text.color === 'auto' ? null : text.color} coarse={coarse} onPick={(hex) => setText({ color: hex })} />
            </Row>
            <div className="font-bold text-pg-cap uppercase tracking-wide text-pg-text2 mt-2">Text Box</div>
            <Row label="Horizontal">
              <Choice label="Horizontal alignment" value={text.align || 'center'} options={[['left', 'Left'], ['center', 'Center'], ['right', 'Right']]} onChange={(align) => setText({ align })} />
            </Row>
            <Row label="Vertical">
              <Choice label="Vertical alignment" value={text.valign || 'middle'} options={[['top', 'Top'], ['middle', 'Middle'], ['bottom', 'Bottom']]} onChange={(valign) => setText({ valign })} />
            </Row>
            <Row label="Autofit">
              <Choice label="Autofit" value={text.autofit || 'none'} options={[['none', 'Do not Autofit'], ['shrink', 'Shrink text on overflow'], ['resize', 'Resize shape to fit text']]} onChange={(autofit) => setText({ autofit })} />
            </Row>
            <Row label="Wrap text in shape">
              <input type="checkbox" checked={text.wrap !== false} onChange={(e) => setText({ wrap: e.target.checked })} className="w-4 h-4 accent-[rgb(var(--pg-accent-fill))]" aria-label="Wrap text in shape" />
            </Row>
            <div className="font-bold text-pg-cap uppercase tracking-wide text-pg-text2 mt-2">Margins</div>
            {[['l', 'Left margin'], ['r', 'Right margin'], ['t', 'Top margin'], ['b', 'Bottom margin']].map(([key, label]) => (
              <Row key={key} label={label}>
                <NumberField label={label} value={((text.insets || DEFAULT_INSETS)[key])} min={0} max={200} step={1} suffix="px" onChange={(v) => setText({ insets: { ...(text.insets || DEFAULT_INSETS), [key]: v } })} />
              </Row>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
