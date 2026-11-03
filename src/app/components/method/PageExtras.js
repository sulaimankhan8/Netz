// Parts the ⭐ pages need for Google and AI assistants (NETZ_METHODS_CATALOG.md, items 5–8 and F13).
// Same card style as the rest of the method page.
import Link from 'next/link';
import { methodById } from '@/app/data/methods';

/** Short FAQ, written from the method's search words. items: [{ q, a }]. Answers are in the HTML, open or closed. */
export function Faq({ items, heading = 'Common Questions' }) {
  if (!items?.length) return null;
  return (
    <div className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight pb-2 border-b-2 border-black/80 dark:border-neutral-700">
        {heading}
      </h2>
      <div className="space-y-3">
        {items.map((it, i) => (
          <details key={i} className="group border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
            <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-4 min-h-[48px] text-sm md:text-base font-bold text-black dark:text-white [&::-webkit-details-marker]:hidden">
              <span>{it.q}</span>
              <span aria-hidden="true" className="shrink-0 font-mono text-lg leading-none transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {it.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

/** Links to related method pages, by id from src/app/data/methods.js. Unknown or hidden ids are skipped. */
export function RelatedMethods({ ids, heading = 'Related Methods' }) {
  const list = (ids || []).map(methodById).filter((m) => m && m.status === 'live');
  if (!list.length) return null;
  return (
    <div className="space-y-3">
      <div className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500">{heading}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((m) => (
          <Link
            key={m.id}
            href={m.route}
            className="flex items-center justify-between gap-3 p-4 min-h-[48px] border-2 border-black/80 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 font-bold text-sm text-black dark:text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none hover:bg-[#FFE600]/20 dark:hover:bg-neutral-700 transition-colors"
          >
            <span>{m.name}</span>
            <span aria-hidden="true" className="font-mono">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** "Used in: Anna, VTU, GTU" — the courses that teach this topic. */
export function UsedIn({ courses }) {
  if (!courses?.length) return null;
  return (
    <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
      <span className="font-bold uppercase tracking-widest">Used in:</span> {courses.join(', ')}
    </p>
  );
}

/** Button that takes a visitor from the method page into Notes. */
export function OpenInNotes({ href = '/Notes', label = 'Open in Notes' }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 border-2 border-black dark:border-white bg-[#FFE600] text-black font-mono font-black text-xs uppercase tracking-widest rounded-md shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform"
    >
      {label} <span aria-hidden="true">→</span>
    </Link>
  );
}
