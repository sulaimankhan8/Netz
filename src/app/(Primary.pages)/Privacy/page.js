import Image from 'next/image';
import Link from 'next/link';
import '../landing.css';
import { LD_FONT } from '../../components/landing/fonts';

export const metadata = {
  title: 'Privacy · NETZ',
  description: 'What NETZ keeps on your device, and what analytics and ads collect.',
};

const sectionStyle = { display: 'flex', flexDirection: 'column', gap: 10 };
const textStyle = { margin: 0, fontSize: 16, lineHeight: '26px', color: 'var(--ld-text2)' };

/** A short privacy notice, linked from the landing page footer (LANDING_REDESIGN_PLAN.md, Q6). */
export default function PrivacyPage() {
  return (
    <div className={`ld-root ${LD_FONT}`}>
      <div className="ld-wrap" style={{ maxWidth: 760, paddingTop: 64, paddingBottom: 96 }}>
        <article className="ld-fact" style={{ padding: 'clamp(24px, 5vw, 48px)', gap: 28 }}>
          <header style={sectionStyle}>
            <Link href="/" className="ld-brand" aria-label="NETZ home" style={{ alignSelf: 'flex-start' }}>
              <Image src="/icons/icon.svg" alt="" width={40} height={40} className="ld-brand-logo" />
              <span>NETZ</span>
            </Link>
            <h1 className="ld-h2">Privacy</h1>
            <p style={textStyle}>Last updated 18 October 2026.</p>
          </header>

          <section style={sectionStyle}>
            <h2 style={{ margin: 0, fontSize: 20 }}>Your work stays on your device</h2>
            <p style={textStyle}>
              Playground pages, notes, settings and finished tours are saved in this browser&apos;s own storage. They
              are not sent to a NETZ server, and clearing this site&apos;s data in your browser removes them.
            </p>
            <p style={textStyle}>
              Handwriting is recognised on your device. The recognition models are downloaded once and kept by the
              browser so they also work offline.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ margin: 0, fontSize: 20 }}>Analytics</h2>
            <p style={textStyle}>
              NETZ uses Google Analytics and Vercel Analytics and Speed Insights to see which pages are used and how
              fast they load: for example pages visited, device and browser type, and approximate location derived
              from your IP address. Google Analytics uses cookies for this.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ margin: 0, fontSize: 20 }}>Ads</h2>
            <p style={textStyle}>
              The landing page shows one ad from Google AdSense. Google may use cookies to show and measure ads,
              including ads based on your visits to this and other sites. You can read how Google uses this data at{' '}
              <a href="https://policies.google.com/technologies/ads" style={{ color: 'var(--ld-accent)' }}>
                policies.google.com/technologies/ads
              </a>{' '}
              and turn off personalised ads at{' '}
              <a href="https://adssettings.google.com" style={{ color: 'var(--ld-accent)' }}>adssettings.google.com</a>.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
