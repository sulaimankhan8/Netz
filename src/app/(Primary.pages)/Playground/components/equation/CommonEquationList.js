'use client';

import React, { useRef, useState } from 'react';
import { COMMON_EQUATIONS, groupsOf } from '../../utils/equations/commonEquations';
import { Tabs, SECTION_LABEL } from '../ui/parts';
import KatexView from './KatexView';

/**
 * One subject's Common Equations (Math, Physics or Chemistry), each drawn as it will look, in
 * topics with a row of topic names that jump to each (one row that scrolls, never wraps). Used by
 * Insert > Equation and by the Equation button of the equation ribbon.
 *
 * listClassName: classes for the scrolling list (its height, where the parent does not bound it).
 */
export default function CommonEquationList({ subject, onPick, listClassName = '' }) {
  const gallery = COMMON_EQUATIONS.find((c) => c.id === subject);
  const groups = groupsOf(gallery);
  const listRef = useRef(null);
  const [current, setCurrent] = useState(null);
  if (!gallery) return null;

  const jumpTo = (group) => {
    setCurrent(group);
    const list = listRef.current;
    const heading = list && list.querySelector(`[data-equation-group="${group}"]`);
    if (heading) list.scrollTo({ top: heading.offsetTop - list.offsetTop, behavior: 'smooth' });
  };
  // The topic in view follows the list as it scrolls
  const followScroll = () => {
    const list = listRef.current;
    if (!list) return;
    let inView = groups[0];
    for (const el of list.querySelectorAll('[data-equation-group]')) {
      if (el.offsetTop - list.offsetTop <= list.scrollTop + 12) inView = el.getAttribute('data-equation-group');
    }
    if (inView !== current) setCurrent(inView);
  };

  return (
    <>
      {groups.length > 0 && (
        <div data-equation-topics>
          <Tabs label="Topics" items={groups.map((g) => ({ id: g, label: g }))} value={current || groups[0]} onSelect={jumpTo} />
        </div>
      )}
      {/* A new list for each subject, so it opens at the top */}
      <div ref={listRef} key={gallery.id} onScroll={followScroll} className={`relative flex flex-col gap-2 overflow-y-auto overscroll-contain pr-1 min-h-0 ${listClassName}`}>
        {gallery.items.map((item, i) => (
          <React.Fragment key={`${item.group || ''}-${item.name}`}>
            {item.group && item.group !== (gallery.items[i - 1] || {}).group && (
              <h4 className={`${SECTION_LABEL} !mb-0 ${i ? 'pt-2' : ''}`} data-equation-group={item.group}>
                {item.group}
              </h4>
            )}
            <button
              type="button"
              onClick={() => onPick(item.latex)}
              title={item.name}
              data-common-equation={item.name}
              className="flex flex-col items-stretch gap-1 text-left group"
            >
              <span className="text-pg-cap font-semibold text-pg-text2">{item.name}</span>
              <span className="block px-3 py-3 rounded-xl border border-pg-line group-hover:bg-pg-tray bg-pg-surface text-pg-ink overflow-x-auto text-center transition-colors">
                <KatexView latex={item.latex} display />
              </span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
