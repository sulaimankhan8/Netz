// Where the app's menus link to. Shared by the laptop side bar and the phone navigation.
import {
  FiHome,
  FiGrid,
  FiFileText,
  FiSliders,
  FiUser,
  FiZap,
  FiTag
} from 'react-icons/fi';
import { unitMenus } from '../../data/methods';

// Unified Navigation Schema (Badges removed as requested)
export const PRIMARY_NAV = [
  { title: 'Home', route: '/', icon: FiHome },
  { title: 'Algorithms Hub', route: '/Algorithems', icon: FiGrid },
  { title: 'Playground', route: '/Playground', icon: FiZap },
  { title: 'Notes Studio', route: '/Notes', icon: FiFileText },
  { title: 'Settings', route: '/Setting', icon: FiSliders },
  { title: 'Profile', route: '/Profile', icon: FiUser },
  { title: 'Pricing', route: '/Pricing', icon: FiTag },
];

// Units → methods, built from the one methods list (src/app/data/methods.js)
export const UNITS_DATA = unitMenus();

/** Every method as one flat list: { title, link, unit, unitId, category }. */
export const ALL_METHODS = UNITS_DATA.flatMap((unit) =>
  unit.subTopics.flatMap((sub) =>
    sub.subTopics
      ? sub.subTopics.map((leaf) => ({ title: leaf.title, link: leaf.link, unit: unit.shortTitle, unitId: unit.id, category: sub.title }))
      : [{ title: sub.title, link: sub.link, unit: unit.shortTitle, unitId: unit.id, category: null }]
  )
);

/** Methods whose title, category or unit match the search text. */
export function searchMethods(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_METHODS.filter((m) =>
    m.title.toLowerCase().includes(q) || (m.category || '').toLowerCase().includes(q) || m.unit.toLowerCase().includes(q)
  );
}

/** The method page at this path, if any. */
export function methodAt(pathname) {
  return ALL_METHODS.find((m) => m.link === pathname) || null;
}
