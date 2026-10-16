'use client';

import React, { useRef, useState } from 'react';
import { LuPipette } from 'react-icons/lu';
import { themePalette, STANDARD_COLORS, readRecentColors, rememberRecentColor } from '../../utils/shapes/officeColors';

/**
 * The colour menu of Word and WPS Office: No Fill (or No Outline), Theme Colors with their
 * lighter and darker variations, Standard Colors, Recent Colors, More Colors and, where the
 * browser has one, an eyedropper.
 *
 * On touch screens every swatch is a 44 px target, so the theme block is shown turned on its
 * side: one row per theme colour, its variations along the row.
 */
export default function ColorPicker({ current, noneLabel, onPick, onNone, coarse = false }) {
  const palette = themePalette();
  const [recent, setRecent] = useState(() => readRecentColors());
  const moreRef = useRef(null);
  const canEyedrop = typeof window !== 'undefined' && 'EyeDropper' in window;
  const value = current ? String(current).toUpperCase() : null;

  const pick = (hex) => {
    setRecent(rememberRecentColor(hex));
    onPick(hex.toUpperCase());
  };

  const swatch = (c, key) => (
    <button
      key={key}
      type="button"
      onClick={() => pick(c.hex)}
      title={c.name}
      aria-label={c.name}
      aria-pressed={value === c.hex}
      className={`${coarse ? 'w-11 h-11 rounded-lg' : 'w-[18px] h-[18px]'} border ${
        value === c.hex ? 'ring-2 ring-offset-1 ring-orange-400 border-orange-500' : 'border-black/10 dark:border-white/15'
      } hover:scale-110 transition-transform`}
      style={{ backgroundColor: c.hex }}
    />
  );

  return (
    <div className="flex flex-col gap-2 text-xs text-zinc-700 dark:text-zinc-300" data-color-picker>
      {noneLabel && (
        <button
          type="button"
          onClick={onNone}
          className={`flex items-center gap-2 px-2 py-1.5 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left ${current === null ? 'font-semibold text-zinc-900 dark:text-zinc-100' : ''}`}
        >
          <span className="w-4 h-4 border border-zinc-400 relative overflow-hidden rounded-sm" aria-hidden="true">
            <span className="absolute left-1/2 top-[-2px] h-[22px] w-px bg-rose-500 rotate-45 origin-center" />
          </span>
          {noneLabel}
        </button>
      )}

      <div className="font-semibold text-[11px] text-zinc-500 dark:text-zinc-400">Theme Colors</div>
      {coarse ? (
        <div className="flex flex-col gap-1">
          {palette.map((column, i) => (
            <div key={i} className="flex gap-1">
              {column.map((c, j) => swatch(c, `${i}-${j}`))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-[3px]">
          <div className="flex gap-[3px]">{palette.map((column, i) => swatch(column[0], `base-${i}`))}</div>
          <div className="flex gap-[3px] mt-1">
            {palette.map((column, i) => (
              <div key={i} className="flex flex-col">
                {column.slice(1).map((c, j) => swatch(c, `${i}-${j}`))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="font-semibold text-[11px] text-zinc-500 dark:text-zinc-400">Standard Colors</div>
      <div className={`flex flex-wrap ${coarse ? 'gap-1' : 'gap-[3px]'}`}>{STANDARD_COLORS.map((c) => swatch(c, c.hex))}</div>

      {recent.length > 0 && (
        <>
          <div className="font-semibold text-[11px] text-zinc-500 dark:text-zinc-400">Recent Colors</div>
          <div className={`flex flex-wrap ${coarse ? 'gap-1' : 'gap-[3px]'}`}>{recent.map((hex) => swatch({ hex, name: hex }, `recent-${hex}`))}</div>
        </>
      )}

      <div className="flex items-center gap-1 pt-1 border-t border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => moreRef.current && moreRef.current.click()}
          className="flex-1 px-2 py-1.5 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
        >
          More Colors...
        </button>
        <input
          ref={moreRef}
          type="color"
          value={value && /^#[0-9A-F]{6}$/.test(value) ? value.toLowerCase() : '#4472c4'}
          onChange={(e) => pick(e.target.value)}
          aria-label="More Colors"
          className="sr-only"
          tabIndex={-1}
        />
        {canEyedrop && (
          <button
            type="button"
            title="Eyedropper: pick a colour from the screen"
            aria-label="Eyedropper"
            onClick={async () => {
              try {
                const result = await new window.EyeDropper().open();
                if (result && result.sRGBHex) pick(result.sRGBHex);
              } catch (e) {}
            }}
            className="p-1.5 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <LuPipette className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
