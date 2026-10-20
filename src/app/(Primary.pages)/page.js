import Image from 'next/image';
import Link from 'next/link';
import './landing.css';
import { LD_FONT } from '../components/landing/fonts';
import { IconArrow, IconGift, IconHand, IconLaptop, IconPhone, IconTablet, IconWifiOff } from '../components/landing/icons';
import AdSlot from '../components/landing/AdSlot';
import FloatingCards from '../components/landing/FloatingCards';
import HeroDemo from '../components/landing/HeroDemo';
import InstallButton from '../components/landing/install';
import MethodGuide from '../components/landing/MethodGuide';
import RevealObserver from '../components/landing/RevealObserver';
import TourCards from '../components/landing/TourCards';

const DESCRIPTION =
  'Write maths by hand and NETZ types it for you. Solve it step by step, see it on a graph, and keep it all in your notes. Free, works offline, no account.';

export const metadata = {
  title: 'NETZ: write, solve and keep your maths',
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'NETZ',
    title: 'NETZ: write, solve and keep your maths',
    description: DESCRIPTION,
    url: 'https://netz-ruby.vercel.app',
    images: [{ url: 'https://netz-ruby.vercel.app/icons/icon-512x512.png', width: 512, height: 512, alt: 'NETZ' }],
  },
  twitter: {
    card: 'summary',
    title: 'NETZ: write, solve and keep your maths',
    description: DESCRIPTION,
    images: ['https://netz-ruby.vercel.app/icons/icon-512x512.png'],
  },
};

/**
 * The landing page (LANDING_REDESIGN_PLAN.md; board "Netz Landing Redesign", artboard 4).
 * A server page: the text renders without waiting for JavaScript. The small interactive parts
 * (hero demo, tour cards, floating cards, method table, install, ad, reveal) are client components.
 */
export default function Home() {
  return (
    <div className={`ld-root ${LD_FONT}`}>
      <RevealObserver />

      <div className="ld-wrap">
        <header className="ld-header">
          <Link href="/" className="ld-brand" aria-label="NETZ home">
            <Image src="/icons/icon.svg" alt="" width={40} height={40} className="ld-brand-logo" priority />
            <span>NETZ</span>
          </Link>
          <InstallButton />
        </header>

        <section className="ld-hero">
          <div className="ld-hero-text ld-on-bg">
            <span className="ld-pill">
              <span className="ld-pill-dot" />
              Free · works offline · no account
            </span>
            <h1 className="ld-h1">Maths you can write, solve and keep.</h1>
            <p className="ld-lead">
              Write maths by hand and NETZ types it for you. Solve it step by step, see it on a graph, and keep
              everything in your notes.
            </p>
            <div className="ld-actions">
              <Link href="/Playground" className="ld-btn ld-btn-main">
                Open the Playground
                <IconArrow />
              </Link>
              <a href="#tours" className="ld-btn ld-btn-secondary">Take a 1-minute tour</a>
            </div>
            <div className="ld-hero-notes">
              <span>Finger, pen or mouse</span>
              <span>Phone, tablet, laptop</span>
              <span>Every step shown</span>
            </div>
          </div>
          <HeroDemo />
        </section>

        <TourCards />

        <section className="ld-section ld-float">
          <FloatingCards />
          <div className="ld-float-text ld-on-bg" data-reveal="">
            <h2 className="ld-h2">Everything a method gives you</h2>
            <p className="ld-sec-lead">
              Every method comes with a graph, the full working, a table of values and a one-tap export, ready to
              drop into your notes.
            </p>
            <Link href="/Algorithems" className="ld-btn ld-btn-secondary" style={{ alignSelf: 'flex-start' }}>
              Open the Algorithms hub
            </Link>
          </div>
        </section>

        <section id="methods" className="ld-section">
          <div className="ld-sec-head" data-reveal="">
            <div className="ld-sec-head-text ld-on-bg">
              <h2 className="ld-h2">Every step, shown</h2>
              <p className="ld-sec-lead">
                Each method page takes you from the idea to the answer. Here is Gauss–Seidel, one step at a time;
                every method works the same way.
              </p>
            </div>
          </div>
          <MethodGuide />
        </section>

        <AdSlot />

        <section className="ld-section" data-reveal="">
          <div className="ld-sec-head">
            <div className="ld-sec-head-text ld-on-bg">
              <h2 className="ld-h2">Made for the way you study</h2>
              <p className="ld-sec-lead">At your desk, on the bus or in the library, with or without a signal.</p>
            </div>
          </div>
          <div className="ld-facts">
            <article className="ld-fact ld-c-pg">
              <div className="ld-fact-top">
                <span className="ld-fact-icon" aria-hidden="true"><IconHand size={24} /></span>
                <span className="ld-fact-devices" aria-hidden="true"><IconPhone size={20} /><IconTablet size={20} /><IconLaptop size={22} /></span>
              </div>
              <h3>Any screen, touch first</h3>
              <p>Built for phones and tablets as much as laptops. Write with a finger, a pen or a mouse, and use two fingers to move and zoom.</p>
              <ul className="ld-fact-tags">
                <li>Finger</li>
                <li>Pen</li>
                <li>Mouse</li>
              </ul>
            </article>
            <article className="ld-fact ld-c-al">
              <div className="ld-fact-top">
                <span className="ld-fact-icon" aria-hidden="true"><IconWifiOff size={24} /></span>
              </div>
              <h3>Works offline</h3>
              <p>Install NETZ like any app. Your handwriting is read on your own device, so it keeps working on a train, in a lecture hall or anywhere without signal.</p>
              <ul className="ld-fact-tags">
                <li>No Wi‑Fi needed</li>
                <li>Installs like an app</li>
              </ul>
            </article>
            <article className="ld-fact ld-c-nt">
              <div className="ld-fact-top">
                <span className="ld-fact-icon" aria-hidden="true"><IconGift size={24} /></span>
              </div>
              <h3>Free, no account</h3>
              <p>Just open it and start. Your pages and notes are kept in your browser, so there is nothing to sign up for and nothing to wait on.</p>
              <ul className="ld-fact-tags">
                <li>No sign-up</li>
                <li>Saved in your browser</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="ld-cta" data-reveal="">
          <div className="ld-cta-text">
            <h2>Open a page and start writing.</h2>
            <p>Your first page is one tap away.</p>
          </div>
          <div className="ld-actions">
            <Link href="/Playground" className="ld-btn ld-btn-light">Open the Playground</Link>
            <InstallButton className="ld-btn ld-btn-outline-light" hintUp icon={false} />
          </div>
        </section>
      </div>

      <div className="ld-footer-strip">
        <div className="ld-wrap">
          <footer className="ld-footer">
            <span>NETZ · 2026</span>
            <nav aria-label="Footer">
              <Link href="/Playground">Playground</Link>
              <Link href="/Notes">Notes</Link>
              <Link href="/Algorithems">Algorithms</Link>
              <Link href="/Setting">Settings</Link>
              <Link href="/Pricing">Pricing</Link>
              <Link href="/Privacy">Privacy</Link>
              <Link href="/Terms">Terms</Link>
              <Link href="/Refund">Refunds</Link>
              <Link href="/Contact">Contact</Link>
            </nav>
          </footer>
        </div>
      </div>
    </div>
  );
}
