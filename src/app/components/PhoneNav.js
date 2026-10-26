'use client';

// Phone navigation: a slim top bar and five buttons along the bottom (Pages, Home, Play, Notes,
// Personalize). Pages and Personalize open sheets, the phone version of the laptop side bar's menus.
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FiFolder, FiHome, FiZap, FiFileText, FiUser, FiSearch, FiX, FiGrid,
  FiLayers, FiChevronRight, FiChevronDown, FiSliders, FiTag, FiCornerDownRight,
} from 'react-icons/fi';
import ProgressChip from './mascot/ProgressChip';
import useProgress from '@/app/utils/progress/useProgress';
import { FlameIcon, GemIcon } from './mascot/art';
import { PRIMARY_NAV, UNITS_DATA, ALL_METHODS, searchMethods, methodAt } from './editorial/navData';

const ME_ROUTES = ['/Profile', '/Setting', '/Pricing'];

// Leaving the Playground with unsaved work asks first, as the laptop side bar does
function guardLeave(e, pathname, target) {
  if (
    typeof window !== 'undefined' &&
    pathname === '/Playground' &&
    target !== '/Playground' &&
    window.__NETZ_PLAYGROUND_HAS_UNSAVED_CHANGES__ &&
    window.__NETZ_OPEN_UNSAVED_MODAL__
  ) {
    e.preventDefault();
    window.__NETZ_OPEN_UNSAVED_MODAL__(target);
  }
}

function pageTitle(pathname) {
  const method = methodAt(pathname);
  if (method) return { title: method.title, sub: UNITS_DATA.find((u) => u.id === method.unitId)?.title.replace(':', ' ·') };
  const nav = PRIMARY_NAV.find((n) => n.route !== '/' && pathname?.startsWith(n.route));
  if (nav) return { title: nav.title, sub: null };
  return null;
}

/** True while the on-screen keyboard is up (a text field has focus and the visible area shrank). */
function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const check = () => {
      const el = document.activeElement;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      setOpen(Boolean(typing) && vv.height < window.innerHeight - 120);
    };
    vv.addEventListener('resize', check);
    window.addEventListener('focusin', check);
    window.addEventListener('focusout', check);
    return () => {
      vv.removeEventListener('resize', check);
      window.removeEventListener('focusin', check);
      window.removeEventListener('focusout', check);
    };
  }, []);
  return open;
}

export function PhoneTopBar() {
  const pathname = usePathname();
  const info = pageTitle(pathname);
  return (
    <header
      data-app-nav
      className="relative z-30 flex h-16 shrink-0 items-center gap-3 border-b border-neutral-300 bg-[#FAF9F6] px-4 font-mono text-neutral-900 dark:border-neutral-800 dark:bg-[#121212] dark:text-neutral-100"
    >
      <div className="absolute inset-0 pointer-events-none opacity-20 editorial-dots-bg" aria-hidden="true" />
      {info ? (
        <div className="relative min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold leading-tight">{info.title}</p>
          {info.sub && <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">{info.sub}</p>}
        </div>
      ) : (
        <Link href="/" className="relative flex min-h-[44px] flex-1 items-center gap-2" aria-label="NETZ home">
          <Image src="/icons/icon.svg" alt="" width={32} height={32} />
          <span className="text-base font-black tracking-tight">NETZ</span>
        </Link>
      )}
      <div className="relative shrink-0">
        <ProgressChip variant="phone" />
      </div>
    </header>
  );
}

function SheetRow({ href, icon: Icon, title, hint, badge, onClick, strong }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-[13px] text-neutral-900 hover:bg-neutral-200/70 dark:text-neutral-100 dark:hover:bg-neutral-800 ${strong ? 'border border-neutral-300 bg-white font-extrabold dark:border-neutral-700 dark:bg-[#121212]' : 'font-bold'}`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
      <span className="flex min-w-0 flex-1 flex-col py-1.5">
        <span className="truncate">{title}</span>
        {hint && <span className="truncate text-[11px] font-normal text-neutral-500">{hint}</span>}
      </span>
      {badge}
      {!badge && <FiChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden="true" />}
    </Link>
  );
}

function PagesSheet({ pathname, onGo }) {
  const [query, setQuery] = useState('');
  const current = methodAt(pathname);
  const [openUnit, setOpenUnit] = useState(current?.unitId || null);
  const [openCat, setOpenCat] = useState(current?.category || null);
  const results = useMemo(() => searchMethods(query), [query]);

  const leafClass = (link) =>
    `flex min-h-[44px] items-center rounded-lg px-3 text-[13px] ${
      pathname === link
        ? 'bg-neutral-900 font-bold text-white dark:bg-white dark:text-neutral-900'
        : 'text-neutral-700 hover:bg-neutral-200/70 dark:text-neutral-300 dark:hover:bg-neutral-800'
    }`;

  return (
    <>
      <label className="flex h-11 shrink-0 items-center gap-2.5 rounded-xl border border-neutral-300 bg-white px-3 dark:border-neutral-700 dark:bg-[#121212]">
        <FiSearch className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${ALL_METHODS.length} algorithms…`}
          aria-label="Search algorithms"
          className="min-w-0 flex-1 bg-transparent font-mono text-base text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="-mr-2 flex h-11 w-11 items-center justify-center text-neutral-400">
            <FiX className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </label>

      {query.trim() ? (
        <div className="flex flex-col gap-1">
          <p className="px-1.5 pt-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-neutral-500">Search results ({results.length})</p>
          {results.length === 0 && <p className="p-4 text-center text-xs text-neutral-500">No algorithms match &quot;{query}&quot;</p>}
          {results.map((m) => (
            <Link key={m.link} href={m.link} onClick={(e) => onGo(e, m.link)} className="flex min-h-[52px] flex-col justify-center gap-1 rounded-xl px-3 hover:bg-neutral-200/70 dark:hover:bg-neutral-800">
              <span className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">{m.title}</span>
              <span className="flex gap-1.5 text-[10px] text-neutral-500">
                <span className="rounded bg-neutral-200 px-1.5 font-extrabold dark:bg-neutral-800">{m.unit}</span>
                {m.category && <span className="truncate">/ {m.category}</span>}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <>
          <SheetRow href="/Algorithems" icon={FiGrid} title="Algorithms Hub" strong onClick={(e) => onGo(e, '/Algorithems')}
            badge={<span className="text-[11px] font-normal text-neutral-500">all {ALL_METHODS.length}</span>} />
          <p className="px-1.5 pt-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-neutral-500">Units</p>
          {UNITS_DATA.map((unit) => {
            const open = openUnit === unit.id;
            const here = current?.unitId === unit.id;
            const count = ALL_METHODS.filter((m) => m.unitId === unit.id).length;
            return (
              <div key={unit.id} className="flex flex-col gap-1">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenUnit(open ? null : unit.id)}
                  className={`flex min-h-[48px] items-center gap-2.5 rounded-xl border px-3 text-left text-[13px] transition-colors ${
                    open || here
                      ? 'border-amber-300 bg-amber-50 font-extrabold text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200'
                      : 'border-transparent font-bold text-neutral-800 hover:bg-neutral-200/70 dark:text-neutral-200 dark:hover:bg-neutral-800'
                  }`}
                >
                  <FiLayers className={`h-4 w-4 shrink-0 ${open || here ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400'}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{unit.title.replace(':', ' ·')}</span>
                  <span className="text-[11px] font-normal tabular-nums text-neutral-500">{count}</span>
                  {open ? <FiChevronDown className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" /> : <FiChevronRight className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />}
                </button>
                {open && (
                  <div className="ml-3 flex flex-col gap-0.5 border-l border-neutral-300 pl-2.5 dark:border-neutral-700">
                    {unit.subTopics.map((sub) => {
                      if (!sub.subTopics) {
                        return <Link key={sub.link} href={sub.link} onClick={(e) => onGo(e, sub.link)} className={leafClass(sub.link)}>{sub.title}</Link>;
                      }
                      const catOpen = openCat === sub.title;
                      return (
                        <div key={sub.title} className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            aria-expanded={catOpen}
                            onClick={() => setOpenCat(catOpen ? null : sub.title)}
                            className="flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-left text-[12px] font-bold text-neutral-600 hover:bg-neutral-200/70 dark:text-neutral-400 dark:hover:bg-neutral-800"
                          >
                            <FiCornerDownRight className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden="true" />
                            <span className="min-w-0 flex-1">{sub.title}</span>
                            {catOpen ? <FiChevronDown className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" /> : <FiChevronRight className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />}
                          </button>
                          {catOpen && (
                            <div className="ml-3 flex flex-col gap-0.5 border-l border-neutral-300/80 pl-2.5 dark:border-neutral-800">
                              {sub.subTopics.map((leaf) => (
                                <Link key={leaf.link} href={leaf.link} onClick={(e) => onGo(e, leaf.link)} className={leafClass(leaf.link)}>{leaf.title}</Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </>
  );
}

function PersonalizeSheet({ onGo }) {
  const snap = useProgress();
  const s = snap?.summary;
  return (
    <>
      {s && (
        <Link href="/Profile" onClick={(e) => onGo(e, '/Profile')} className="flex min-h-[56px] items-center gap-4 rounded-xl border border-neutral-300 bg-white px-3 text-[13px] font-bold tabular-nums text-neutral-900 dark:border-neutral-700 dark:bg-[#121212] dark:text-neutral-100">
          <span className="flex items-center gap-1"><FlameIcon size={16} />{s.streak}</span>
          <span className="flex items-center gap-1"><GemIcon size={16} />{s.gems}</span>
          <span className="ml-auto font-normal text-neutral-500 dark:text-neutral-400">{Math.min(s.doneToday, s.goal)}/{s.goal} today</span>
        </Link>
      )}
      <SheetRow href="/Profile" icon={FiUser} title="Profile" hint="Tasks, medals, shop, robot" onClick={(e) => onGo(e, '/Profile')} />
      <SheetRow href="/Setting" icon={FiSliders} title="Settings" hint="Theme, handwriting, account" onClick={(e) => onGo(e, '/Setting')} />
      <SheetRow
        href="/Pricing"
        icon={FiTag}
        title="Pricing"
        onClick={(e) => onGo(e, '/Pricing')}
        badge={<span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-extrabold text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300">PRO</span>}
      />
    </>
  );
}

const TABS = [
  { key: 'pages', label: 'Pages', icon: FiFolder },
  { key: 'home', label: 'Home', icon: FiHome, route: '/' },
  { key: 'play', label: 'Play', icon: FiZap, route: '/Playground' },
  { key: 'notes', label: 'Notes', icon: FiFileText, route: '/Notes' },
  { key: 'me', label: 'Personalize', icon: FiUser },
];

function activeTab(pathname) {
  if (!pathname) return null;
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/Playground')) return 'play';
  if (pathname.startsWith('/Notes')) return 'notes';
  if (ME_ROUTES.some((r) => pathname.startsWith(r))) return 'me';
  if (pathname.startsWith('/Algorithems') || methodAt(pathname)) return 'pages';
  return null;
}

export function PhoneTabBar() {
  const pathname = usePathname();
  const [sheet, setSheet] = useState(null);
  const keyboardOpen = useKeyboardOpen();
  const sheetRef = useRef(null);
  const active = activeTab(pathname);

  // A new page closes the sheet
  useEffect(() => { setSheet(null); }, [pathname]);

  useEffect(() => {
    if (!sheet) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setSheet(null); };
    window.addEventListener('keydown', onKey);
    sheetRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet]);

  const go = (e, target) => {
    guardLeave(e, pathname, target);
    if (target === pathname) setSheet(null);
  };

  const hidden = keyboardOpen && !sheet;

  return (
    <>
      {sheet && (
        <>
          <div className="fixed inset-x-0 top-0 z-40 bg-black/60" style={{ bottom: 'var(--app-tab-h, 0px)' }} onClick={() => setSheet(null)} aria-hidden="true" />
          <div
            ref={sheetRef}
            tabIndex={-1}
            role="dialog"
            aria-label={sheet === 'pages' ? 'Pages' : 'Personalize'}
            className="fixed inset-x-2 z-50 mx-auto flex max-h-[min(72dvh,640px)] max-w-[440px] flex-col gap-1 overflow-y-auto overscroll-contain rounded-2xl border-2 border-neutral-900 bg-[#FAF9F6] p-2.5 font-mono shadow-2xl outline-none dark:border-neutral-600 dark:bg-[#1A1A1A]"
            style={{ bottom: 'calc(var(--app-tab-h, 0px) + 8px)' }}
          >
            <div className="flex items-center border-b border-neutral-300 pb-1.5 pl-1.5 dark:border-neutral-700">
              <h2 className="flex-1 text-xs font-black uppercase tracking-[0.12em] text-neutral-900 dark:text-white">{sheet === 'pages' ? 'Pages' : 'Personalize'}</h2>
              <button type="button" onClick={() => setSheet(null)} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800">
                <FiX className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-col gap-1 pt-1.5">
              {sheet === 'pages' ? <PagesSheet pathname={pathname} onGo={go} /> : <PersonalizeSheet onGo={go} />}
            </div>
          </div>
        </>
      )}

      <nav
        data-app-tabs
        aria-label="Main"
        className={`fixed inset-x-0 bottom-0 z-40 grid-cols-5 border-t border-neutral-300 bg-[#FAF9F6] px-1.5 pt-2 font-mono dark:border-neutral-800 dark:bg-[#121212] ${hidden ? 'hidden' : 'grid'}`}
        style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))' }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-20 editorial-dots-bg" aria-hidden="true" />
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isOpen = sheet === tab.key;
          const isHere = !sheet && active === tab.key;
          const tile = isOpen
            ? 'bg-amber-400 text-neutral-900 shadow-md'
            : isHere
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-500 dark:text-neutral-400';
          const label = isOpen
            ? 'text-amber-700 dark:text-amber-400 font-extrabold'
            : isHere ? 'text-neutral-900 dark:text-white font-extrabold' : 'text-neutral-500 dark:text-neutral-400 font-bold';
          const inner = (
            <>
              <span className={`flex h-11 w-12 items-center justify-center rounded-xl transition-colors ${tile}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className={`text-[9px] uppercase tracking-[0.04em] ${label}`}>{tab.label}</span>
            </>
          );
          const cls = 'relative flex flex-col items-center gap-1 select-none [-webkit-tap-highlight-color:transparent]';
          if (tab.route) {
            return (
              <Link key={tab.key} href={tab.route} aria-current={isHere ? 'page' : undefined} className={cls}
                onClick={(e) => { setSheet(null); guardLeave(e, pathname, tab.route); }}>
                {inner}
              </Link>
            );
          }
          return (
            <button key={tab.key} type="button" aria-expanded={isOpen} aria-haspopup="dialog" aria-current={isHere ? 'page' : undefined} className={cls}
              onClick={() => setSheet(isOpen ? null : tab.key)}>
              {inner}
            </button>
          );
        })}
      </nav>
    </>
  );
}
