'use client';

import React, { useRef } from 'react';
import { COMMON_EQUATIONS, groupsOf } from '../../utils/equations/commonEquations';
import KatexView from './KatexView';

/**
 * One subject's Common Equations (Math, Physics or Chemistry), each drawn as it will look, in
 * topics with a row of topic names that jump to each. Used by Insert > Equation and by the
 * Equation button of the equation ribbon.
 *
 * listClassName: classes for the scrolling list (its height, where the parent does not bound it).
 */
export default function CommonEquationList({ subject, onPick, listClassName = '' }) {
  const gallery = COMMON_EQUATIONS.find((c) => c.id === subject);
  const groups = groupsOf(gallery);
  const listRef = useRef(null);
  if (!gallery) return null;

  const jumpTo = (group) => {
    const list = listRef.current;
    const heading = list && list.querySelector(`[data-equation-group="${group}"]`);
    if (heading) list.scrollTo({ top: heading.offsetTop - list.offsetTop, behavior: 'smooth' });
  };

  return (
    <>
      {groups.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 shrink-0" data-equation-topics>
          {groups.map((g) => (
            <button key={g} type="button" onClick={() => jumpTo(g)} className="px-2.5 h-8 rounded-lg shrink-0 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-700">
              {g}
            </button>
          ))}
        </div>
      )}
      {/* A new list for each subject, so it opens at the top */}
      <div ref={listRef} key={gallery.id} className={`relative flex flex-col gap-2 overflow-y-auto overscroll-contain pr-1 min-h-0 ${listClassName}`}>
        {gallery.items.map((item, i) => (
          <React.Fragment key={`${item.group || ''}-${item.name}`}>
            {item.group && item.group !== (gallery.items[i - 1] || {}).group && (
              <h4 className={`text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 ${i ? 'pt-2' : ''}`} data-equation-group={item.group}>
                {item.group}
              </h4>
            )}
            <button
              type="button"
              onClick={() => onPick(item.latex)}
              title={item.name}
              data-common-equation={item.name}
              className="flex flex-col items-stretch gap-1 text-left"
            >
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{item.name}</span>
              <span className="block px-3 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 overflow-x-auto text-center">
                <KatexView latex={item.latex} display />
              </span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
