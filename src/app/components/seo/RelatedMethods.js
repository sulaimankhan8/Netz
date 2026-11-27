'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LIVE_METHODS, UNITS, methodByRoute } from '../../data/methods';

/**
 * "More in this unit" links at the foot of every method page.
 * Why: the side menu is drawn in the browser, so a search engine reading the page's plain HTML found only a
 * handful of links to other methods. These links are in that HTML, so every live page is reachable from its
 * neighbours (and from the Algorithms hub link), including the pages the hub list does not show as cards.
 * Same-category methods come first; at most 12 are shown.
 */
const MAX_LINKS = 12;

export default function RelatedMethods() {
  const pathname = usePathname();
  const current = methodByRoute(pathname);
  if (!current || current.status !== 'live') return null;

  const unit = UNITS.find((u) => u.unit === current.unit);
  const others = LIVE_METHODS.filter((m) => m.unit === current.unit && m.id !== current.id);
  const sameCategory = others.filter((m) => current.category && m.category === current.category);
  const rest = others.filter((m) => !(current.category && m.category === current.category));
  const links = [...sameCategory, ...rest].slice(0, MAX_LINKS);

  return (
    <nav
      aria-label="Related methods"
      className="md:ml-[80px] px-8 py-8 text-sm border-t border-neutral-300/40 dark:border-neutral-600/60 dark:text-neutral-200"
    >
      <p className="font-semibold mb-3">More in {unit ? unit.title : 'this unit'}</p>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {links.map((m) => (
          <li key={m.id}>
            <Link href={m.route} className="underline-offset-2 hover:underline opacity-90">
              {m.name}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4">
        <Link href="/Algorithems" className="font-semibold underline-offset-2 hover:underline">
          See all NETZ methods
        </Link>
      </p>
    </nav>
  );
}
