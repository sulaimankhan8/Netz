'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LD_FONT } from '../../components/landing/fonts';
import { CURRENCIES, PLANS, PLAN_ORDER, PRO_LIMITS, formatPrice, guessCurrency, yearlyPerMonth, yearlySaving } from '../../utils/pricing';
import { FREE_CLOUD_NOTES } from '../Notes/utils/notesCore';
import { FREE_PUBLIC_NOTES } from '../Notes/utils/publishCore';
import useCheckout, { PAYMENTS_OPEN } from './useCheckout';

const CURRENCY_KEY = 'netz_currency';

const FREE_FEATURES = [
  'All 34 solvers with steps, graphs and tables',
  'Notes, Playground and handwriting',
  'Tasks, streaks, medals and the gem shop',
  `Cloud copy of ${FREE_CLOUD_NOTES} notes, ${FREE_PUBLIC_NOTES} public links`,
  'PNG and PDF export with a small NETZ mark',
];

const PRO_FEATURES = [
  <>Everything in Free, with <strong>no ads</strong></>,
  `Unlimited cloud notes, ${PRO_LIMITS.publicNotes} public links`,
  'Clean PDF, SVG, LaTeX and code export',
  'One free streak freeze every month',
  "10 Pro tasks a year, with that year's banner, robot skin and medal to keep",
];

// [feature, Free, Pro, Free cell shown quieter]
const COMPARE = [
  ['Solvers, steps, graphs, notes, Playground, handwriting', true, true],
  ['Tasks, streaks, medals, gem shop', true, true],
  ['Cloud copy of notes', String(FREE_CLOUD_NOTES), 'Unlimited'],
  ['Public note links', String(FREE_PUBLIC_NOTES), String(PRO_LIMITS.publicNotes)],
  ['Exports', 'PNG, PDF with mark', 'Clean PDF, SVG, LaTeX, code', true],
  ['Streak freeze each month', false, '1'],
  ['Yearly Pro tasks and rewards', false, true],
  ['Ads', 'Yes', 'None', true],
];

const QUESTIONS = [
  ['What happens if I cancel?', 'Pro stays on until the end of the period you paid for. Your notes and everything you earned stay.'],
  ['Can I get a refund?', `Yes. A full refund within ${PRO_LIMITS.refundDays} days of your first payment.`, { href: '/Refund', label: 'Refund policy' }],
  ['Do I need an account?', 'For Pro, yes: sign in with Google so Pro works on all your devices.'],
  ['Which payments work?', 'UPI, cards and netbanking in India; international cards in USD. Payments are handled by Razorpay.'],
];

function Check() {
  return <span className="ld-pr-ok" aria-hidden="true">✓</span>;
}

function Cell({ value }) {
  if (value === true) return <><Check /><span className="sr-only">Included</span></>;
  if (value === false) return <><span className="ld-pr-no" aria-hidden="true">–</span><span className="sr-only">Not included</span></>;
  return value;
}

function Segmented({ label, options, value, onChange }) {
  return (
    <div className="ld-pr-seg" role="radiogroup" aria-label={label}>
      {options.map(([key, text, extra]) => (
        <button key={key} type="button" role="radio" aria-checked={value === key} className={value === key ? 'is-on' : ''} onClick={() => onChange(key)}>
          {text}
          {extra && <span className="ld-pr-save">{extra}</span>}
        </button>
      ))}
    </div>
  );
}

export default function PricingView() {
  const [plan, setPlan] = useState('yearly');
  const [currency, setCurrency] = useState('INR');
  const { status, phase, message, buy } = useCheckout();
  const isPro = Boolean(status?.pro);

  useEffect(() => {
    let saved = null;
    try {
      saved = window.localStorage.getItem(CURRENCY_KEY);
    } catch {
      saved = null;
    }
    // The visitor's currency is only known in the browser, so the first render shows rupees
    setCurrency(CURRENCIES[saved] ? saved : guessCurrency());
  }, []);

  const pickCurrency = (next) => {
    setCurrency(next);
    try {
      window.localStorage.setItem(CURRENCY_KEY, next);
    } catch {
      // the choice just isn't remembered
    }
  };

  const saving = yearlySaving(currency);
  const price = formatPrice(PLANS[plan][currency], currency);
  const others = PLAN_ORDER.filter((p) => p !== plan).map((p) => `${formatPrice(PLANS[p][currency], currency)} ${p === 'lifetime' ? 'once for lifetime' : p}`);
  const note = plan === 'yearly'
    ? `About ${yearlyPerMonth(currency)} a month. ${others.join(', or ')}.`
    : plan === 'monthly'
      ? `Cancel any time. Yearly is ${formatPrice(PLANS.yearly[currency], currency)} and saves ${saving}%.`
      : 'Pay once. Pro and every year’s Pro tasks, for as long as NETZ runs.';
  const buyLabel = `Get Pro · ${price} ${plan === 'lifetime' ? 'once' : `a ${plan === 'yearly' ? 'year' : 'month'}`}`;

  const busy = phase === 'starting' || phase === 'paying' || phase === 'confirming';
  const proUntil = status?.until ? new Date(status.until).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const proLine = !isPro ? '' : status.lifetime ? 'You have Pro for life.' : status.renews ? `You have Pro. It renews on ${proUntil}.` : `You have Pro until ${proUntil}.`;
  const buyButton = (extra = '') => {
    if (!PAYMENTS_OPEN) return <button type="button" disabled className={`ld-btn ld-pr-soon ${extra}`}>Pro opens soon</button>;
    if (isPro && (status.lifetime || status.renews || plan !== 'lifetime')) {
      return <Link href="/Profile" className={`ld-btn ld-btn-secondary ${extra}`}>You have Pro · see Profile</Link>;
    }
    return (
      <button type="button" className={`ld-btn ld-btn-main ${extra}`} onClick={() => buy(plan, currency)} disabled={busy} aria-busy={busy}>
        {phase === 'starting' ? 'Opening Razorpay…' : phase === 'confirming' ? 'Turning Pro on…' : buyLabel}
      </button>
    );
  };

  return (
    <div className={`ld-root ${LD_FONT}`}>
      <div className="ld-wrap ld-pr">
        <header className="ld-header">
          <Link href="/" className="ld-brand" aria-label="NETZ home">
            <Image src="/icons/icon.svg" alt="" width={40} height={40} className="ld-brand-logo" />
            <span>NETZ</span>
          </Link>
        </header>

        <section className="ld-pr-hero">
          <div className="ld-hero-text ld-on-bg">
            <span className="ld-pill"><span className="ld-pill-dot" />Every solver stays free</span>
            <h1 className="ld-h1">Free to learn.<br />Pro to go further.</h1>
            <p className="ld-lead">
              Solvers, notes, the Playground and handwriting cost nothing. Pro removes ads and adds unlimited cloud
              notes, more public links and clean exports.
            </p>
          </div>
        </section>

        <div className="ld-pr-switches">
          <Segmented
            label="Billing"
            value={plan}
            onChange={setPlan}
            options={PLAN_ORDER.map((p) => [p, PLANS[p].label, p === 'yearly' ? `−${saving}%` : null])}
          />
          <Segmented label="Currency" value={currency} onChange={pickCurrency} options={Object.entries(CURRENCIES).map(([k, c]) => [k, c.label])} />
        </div>

        <div className="ld-pr-plans">
          <section className="ld-pr-plan ld-pr-plan-pro" aria-labelledby="ld-pr-pro">
            <div className="ld-pr-head">
              <div className="ld-pr-kicker-row">
                <h2 id="ld-pr-pro" className="ld-pr-kicker ld-pr-kicker-pro">PRO</h2>
                <span className="ld-pr-tag">{PLANS[plan].label}</span>
              </div>
              <p className="ld-pr-price" aria-live="polite"><span>{price}</span> {PLANS[plan].per}</p>
              <p className="ld-pr-note">{note}</p>
            </div>
            <ul className="ld-pr-list">
              {PRO_FEATURES.map((f, i) => <li key={i}><Check /><span>{f}</span></li>)}
            </ul>
            <div className="ld-pr-buy">
              {buyButton()}
              <p className="ld-pr-msg" role="status">{message || proLine}</p>
              <span className="ld-pr-fine">UPI, card or netbanking via Razorpay · cancel any time · full refund within {PRO_LIMITS.refundDays} days</span>
            </div>
          </section>

          <section className="ld-pr-plan" aria-labelledby="ld-pr-free">
            <div className="ld-pr-head">
              <h2 id="ld-pr-free" className="ld-pr-kicker">FREE</h2>
              <p className="ld-pr-price"><span>{formatPrice(0, currency)}</span> forever</p>
              <p className="ld-pr-note">Everything you need to learn and practise.</p>
            </div>
            <ul className="ld-pr-list">
              {FREE_FEATURES.map((f) => <li key={f}><Check /><span>{f}</span></li>)}
              <li className="is-muted"><span className="ld-pr-no" aria-hidden="true">–</span><span>Shows ads</span></li>
            </ul>
            <div className="ld-pr-buy">
              {!isPro && <span className="ld-btn ld-btn-secondary ld-pr-current">Current plan</span>}
            </div>
          </section>
        </div>

        <section className="ld-pr-section" aria-labelledby="ld-pr-compare">
          <h2 id="ld-pr-compare" className="ld-h2">Compare</h2>
          <div className="ld-pr-table-wrap">
            <table className="ld-pr-table">
              <thead>
                <tr><th scope="col">Feature</th><th scope="col">Free</th><th scope="col" className="is-pro">Pro</th></tr>
              </thead>
              <tbody>
                {COMPARE.map(([name, free, pro, quiet]) => (
                  <tr key={name}>
                    <th scope="row">{name}</th>
                    <td className={quiet ? 'is-muted' : undefined}><Cell value={free} /></td>
                    <td><Cell value={pro} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ld-pr-section" aria-labelledby="ld-pr-faq">
          <h2 id="ld-pr-faq" className="ld-h2">Questions</h2>
          <div className="ld-pr-faq">
            {QUESTIONS.map(([q, a, link]) => (
              <details key={q} className="ld-pr-q">
                <summary>{q}<span aria-hidden="true" className="ld-pr-q-mark" /></summary>
                <p>{a}{link && <> <Link href={link.href}>{link.label}</Link></>}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="ld-pr-footer">
          <span>NETZ · 2026</span>
          <nav aria-label="Legal pages">
            <Link href="/Terms">Terms</Link>
            <Link href="/Refund">Refunds</Link>
            <Link href="/Privacy">Privacy</Link>
            <Link href="/Contact">Contact</Link>
          </nav>
        </footer>
      </div>

      <div className="ld-pr-bar">{buyButton('ld-pr-bar-btn')}</div>
    </div>
  );
}
