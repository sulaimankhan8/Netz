'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useInstall } from './install';
import { readDoneTours } from '../tour/tours';
import {
  IconArrowUpRight, IconCheck, IconCircle, IconCrop, IconDownload, IconHand, IconMoon,
  IconNote, IconQuiz, IconSearch, IconShapes, IconSquare, IconSteps, IconSun, IconUser, IconWifiOff,
} from './icons';

/*
 * The tour cards (board artboards 4 and 9). Each card opens its page with ?tour=<id>; the page runs
 * the tour and records it in localStorage "netz.tours" ({ id: true }), which is how a card knows to
 * say "Done". The Gauss–Seidel tour also keeps its older key, gaussSeidelTourCompleted.
 */
const TOURS = [
  {
    id: 'playground', tone: 'pg', area: 'Playground', href: '/Playground?tour=playground', meta: '5 steps · 1 min',
    title: 'Write by hand', icon: IconHand,
    text: 'Write an equation with a finger, pen or mouse, see it typed, then find roots, plot or differentiate it.',
    art: (
      <div className="ld-grid-paper" style={{ position: 'absolute', inset: 0, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span className="ld-art-hand">y = x² + 1</span>
        <span className="ld-tag ld-tag-teal" style={{ alignSelf: 'flex-start', fontSize: 12 }}>
          Typed: y = x<sup style={{ fontSize: 9 }}>2</sup> + 1
        </span>
      </div>
    ),
  },
  {
    id: 'insert', tone: 'pg', area: 'Playground', href: '/Playground?tour=insert', meta: '5 steps · 1 min',
    title: 'Shapes, symbols and screenshots', icon: IconShapes,
    text: 'Insert menus that work like an office app: shapes and arrows, maths symbols, screenshots and equations.',
    art: (
      <>
        <div className="ld-art-ribbon">
          <span className="ld-art-tile"><IconSquare /></span>
          <span className="ld-art-tile"><IconCircle /></span>
          <span className="ld-art-tile"><IconArrowUpRight /></span>
          <span className="ld-art-tile">Σ</span>
          <span className="ld-art-tile"><IconCrop /></span>
        </div>
        <span className="ld-art-caption">Insert · Shapes · Symbols · Screenshot · Equation</span>
      </>
    ),
  },
  {
    id: 'notes', tone: 'nt', area: 'Notes Studio', href: '/Notes?tour=notes', meta: '6 steps · 1 min',
    title: 'Notes made of blocks', icon: IconNote,
    text: 'Text, headings, formulas and callouts. Type / to add any block, then share with a key or export to PDF.',
    art: (
      <>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Unit 1 · Newton–Raphson</div>
        <div className="ld-art-line" style={{ width: '78%' }} />
        <div className="ld-art-line" style={{ width: '60%' }} />
        <div className="ld-art-box ld-math">
          x<sub style={{ fontSize: 10 }}>n+1</sub> = x<sub style={{ fontSize: 10 }}>n</sub> − f(x<sub style={{ fontSize: 10 }}>n</sub>) / f′(x<sub style={{ fontSize: 10 }}>n</sub>)
        </div>
      </>
    ),
  },
  {
    id: 'blocks', tone: 'nt', area: 'Notes Studio', href: '/Notes?tour=blocks', meta: '4 steps · 1 min',
    title: 'Quizzes, solvers and sketches', icon: IconQuiz,
    text: 'Put a live solver, a quiz or a hand-drawn sketch inside a note, so revision answers back.',
    art: (
      <>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Quiz · root of x³ − 2x − 5</div>
        <div className="ld-art-option is-right"><span className="ld-mono">x ≈ 2.0946</span><span>Correct</span></div>
        <div className="ld-art-option"><span className="ld-mono">x ≈ 2.5000</span></div>
      </>
    ),
  },
  {
    id: 'hub', tone: 'al', area: 'Algorithms', href: '/Algorithems?tour=hub', meta: '4 steps · 40 s',
    title: 'Find the right method', icon: IconSearch,
    text: 'Search every method across five units, run one right there, or open its full page.',
    art: (
      <>
        <div className="ld-art-search"><IconSearch size={16} />Search methods</div>
        <div className="ld-art-row">
          <span className="ld-art-chip is-on">All</span>
          <span className="ld-art-chip">Unit 1</span>
          <span className="ld-art-chip">Unit 2</span>
          <span className="ld-art-chip">Unit 3</span>
          <span className="ld-art-chip">Unit 4</span>
        </div>
      </>
    ),
  },
  {
    id: 'gauss-seidel', tone: 'al', area: 'Algorithms', href: '/Gauss-seidal?tour=true', meta: '5 steps · 2 min',
    title: 'Learn a method, step by step', icon: IconSteps,
    text: 'Gauss–Seidel from the idea to the answer: formula, worked example, iteration table, graph and export.',
    art: (
      <svg width="100%" height="104" viewBox="0 0 300 104" fill="none">
        <path d="M10 92 H290" stroke="var(--ld-teal)" strokeOpacity="0.3" />
        <path d="M20 100 C 80 98, 120 90, 160 62 S 240 10, 290 6" stroke="var(--ld-teal)" strokeWidth="3" strokeLinecap="round" />
        <path d="M150 92 V 68" stroke="var(--ld-teal)" strokeDasharray="4 4" />
        <circle cx="150" cy="70" r="5" fill="var(--ld-teal)" />
        <circle cx="182" cy="46" r="4" fill="var(--ld-surface)" stroke="var(--ld-teal)" strokeWidth="2" />
        <circle cx="200" cy="35" r="4" fill="var(--ld-surface)" stroke="var(--ld-teal)" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'settings', tone: 'app', area: 'Settings', href: '/Setting?tour=settings', meta: '3 steps · 30 s',
    title: 'Make it yours', icon: IconMoon,
    text: 'Switch between light and dark (the background looks its best in dark) and find your way around the menu.',
    art: (
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, height: 92, borderRadius: 12, background: '#FFFFFF', border: '1px solid #E4E4DF', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, color: '#B45309' }}>
          <IconSun size={20} />
          <div style={{ height: 6, width: '70%', borderRadius: 3, background: '#E4E4DF' }} />
          <div style={{ height: 6, width: '50%', borderRadius: 3, background: '#E4E4DF' }} />
        </div>
        <div style={{ flex: 1, height: 92, borderRadius: 12, background: '#141415', border: '2px solid #4F46E5', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, color: '#A5B4FC' }}>
          <IconMoon size={20} />
          <div style={{ height: 6, width: '70%', borderRadius: 3, background: '#34343A' }} />
          <div style={{ height: 6, width: '50%', borderRadius: 3, background: '#34343A' }} />
        </div>
      </div>
    ),
  },
];

const DOWNLOAD_ART = (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
    <div style={{ width: 64, height: 100, borderRadius: 14, border: '2px solid var(--ld-ink)', background: 'var(--ld-surface)', padding: '10px 8px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 6, alignContent: 'start' }}>
      <Image src="/icons/icon.svg" alt="" width={20} height={20} style={{ display: 'block', margin: '0 auto' }} />
      <span style={{ height: 20, borderRadius: 6, background: 'var(--ld-line)' }} />
      <span style={{ height: 20, borderRadius: 6, background: 'var(--ld-line)' }} />
      <span style={{ height: 20, borderRadius: 6, background: 'var(--ld-line)' }} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--ld-text2)' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconWifiOff size={16} />No Wi-Fi? Still works</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconDownload size={16} />On your home screen</span>
    </div>
  </div>
);

function CardBody({ tour, cta, ctaClass = '', badge = null, text }) {
  const Icon = tour.icon;
  return (
    <>
      <span className="ld-card-icon" aria-hidden="true"><Icon size={22} /></span>
      <span className="ld-card-body">
        <span className="ld-card-kicker">{tour.area}{badge}</span>
        <span className="ld-card-title">{tour.title}</span>
        <span className="ld-card-text">{text ?? tour.text}</span>
        <span className="ld-card-foot">
          <span className={`ld-card-cta ${ctaClass}`}>{cta}</span>
          {tour.meta && <span className="ld-card-meta ld-mono">{tour.meta}</span>}
        </span>
      </span>
    </>
  );
}

function InstallCard() {
  const { ready, installed, canPrompt, hint, prompt } = useInstall();
  const [showHint, setShowHint] = useState(false);
  const tour = { area: 'App', title: 'Install and use offline', icon: IconDownload, meta: installed ? null : 'Install prompt' };
  const text = showHint ? hint : 'Add NETZ to your home screen or dock. Handwriting is read on your device, so it keeps working without Wi-Fi.';

  const onClick = async () => {
    if (canPrompt) {
      await prompt();
      return;
    }
    setShowHint((value) => !value);
  };

  if (ready && installed) {
    return (
      <div className="ld-card ld-c-app">
        <span className="ld-card-art" aria-hidden="true">{DOWNLOAD_ART}</span>
        <CardBody tour={tour} cta={<><IconCheck size={16} />Installed</>} ctaClass="is-done" text="NETZ is installed on this device and works offline." />
      </div>
    );
  }

  return (
    <button type="button" className="ld-card ld-c-app" onClick={onClick} aria-expanded={canPrompt ? undefined : showHint}>
      <span className="ld-card-art" aria-hidden="true">{DOWNLOAD_ART}</span>
      <CardBody tour={tour} cta="Install app →" text={text} />
    </button>
  );
}

export default function TourCards() {
  const [done, setDone] = useState({});

  useEffect(() => {
    setDone(readDoneTours());
    const refresh = () => setDone(readDoneTours());
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const doneCount = TOURS.filter((tour) => done[tour.id]).length;

  return (
    <section id="tours" className="ld-section">
      <div className="ld-sec-head" data-reveal="">
        <div className="ld-sec-head-text ld-on-bg">
          <h2 className="ld-h2">Pick a card. Learn it in a minute.</h2>
          <p className="ld-sec-lead">
            Each card opens that part of NETZ and walks you through it, one step at a time. Skip whenever you like;
            finished tours get a tick.
          </p>
        </div>
        <span className="ld-count ld-on-bg" aria-live="polite">
          {doneCount} of {TOURS.length} tours done
        </span>
      </div>

      <div className="ld-tour-grid">
        {TOURS.map((tour) => {
          const isDone = Boolean(done[tour.id]);
          return (
            <Link key={tour.id} href={tour.href} className={`ld-card ld-c-${tour.tone}`}>
              <span className="ld-card-art" aria-hidden="true" style={{ position: 'relative' }}>{tour.art}</span>
              <CardBody
                tour={tour}
                cta={isDone ? <><IconCheck size={16} />Done · Replay</> : 'Start tour →'}
                ctaClass={isDone ? 'is-done' : ''}
              />
            </Link>
          );
        })}

        <InstallCard />

        <div className="ld-card ld-c-app is-soon">
          <span className="ld-card-art" aria-hidden="true" style={{ background: 'var(--ld-paper)', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 14, opacity: 0.7 }}>
            <span style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--ld-tray)', border: '1px solid var(--ld-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ld-text2)' }}>
              <IconUser size={26} />
            </span>
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ height: 8, width: '70%', borderRadius: 4, background: 'var(--ld-line)' }} />
              <span style={{ height: 8, width: '45%', borderRadius: 4, background: 'var(--ld-line)' }} />
            </span>
          </span>
          <CardBody
            tour={{ area: 'Profile', title: 'Your profile', icon: IconUser }}
            badge={<span className="ld-badge">Soon</span>}
            text="Your saved pages, notes and finished tours in one place. Its tour arrives together with accounts."
            cta="Coming with accounts"
          />
        </div>
      </div>
    </section>
  );
}
