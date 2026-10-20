import Image from 'next/image';
import Link from 'next/link';
import '../../(Primary.pages)/landing.css';
import { LD_FONT } from './fonts';
import { LEGAL } from './legalDetails';

const sectionStyle = { display: 'flex', flexDirection: 'column', gap: 10 };
export const textStyle = { margin: 0, fontSize: 16, lineHeight: '26px', color: 'var(--ld-text2)' };
export const linkStyle = { color: 'var(--ld-accent)' };

const PAGES = [
  ['/Pricing', 'Pricing'],
  ['/Terms', 'Terms'],
  ['/Refund', 'Refunds'],
  ['/Privacy', 'Privacy'],
  ['/Contact', 'Contact'],
];

/** One titled part of a legal page. */
export function LegalSection({ title, children }) {
  return (
    <section style={sectionStyle}>
      <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
      {children}
    </section>
  );
}

export function P({ children }) {
  return <p style={textStyle}>{children}</p>;
}

/** The shared frame of the Terms, Refund, Privacy and Contact pages, in the landing page style. */
export default function LegalPage({ title, children }) {
  return (
    <div className={`ld-root ${LD_FONT}`}>
      <div className="ld-wrap" style={{ maxWidth: 760, paddingTop: 64, paddingBottom: 96 }}>
        <article className="ld-fact" style={{ padding: 'clamp(24px, 5vw, 48px)', gap: 28 }}>
          <header style={sectionStyle}>
            <Link href="/" className="ld-brand" aria-label="NETZ home" style={{ alignSelf: 'flex-start' }}>
              <Image src="/icons/icon.svg" alt="" width={40} height={40} className="ld-brand-logo" />
              <span>NETZ</span>
            </Link>
            <h1 className="ld-h2">{title}</h1>
            <p style={textStyle}>Last updated {LEGAL.updated}.</p>
          </header>

          {children}

          <nav aria-label="Legal pages" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', paddingTop: 8, borderTop: '1px solid var(--ld-line, rgba(127,127,127,0.25))' }}>
            {PAGES.map(([href, label]) => (
              <Link key={href} href={href} style={{ ...linkStyle, fontWeight: 600, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{label}</Link>
            ))}
          </nav>
        </article>
      </div>
    </div>
  );
}

/** Follows "email": the owner's address once filled in, otherwise "us through the Contact page". */
export function ContactLine() {
  return LEGAL.email
    ? <a href={`mailto:${LEGAL.email}`} style={linkStyle}>{LEGAL.email}</a>
    : <>us through <Link href="/Contact" style={linkStyle}>the Contact page</Link></>;
}
