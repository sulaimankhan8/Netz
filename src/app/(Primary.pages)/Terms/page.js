import Link from 'next/link';
import LegalPage, { ContactLine, LegalSection, P, linkStyle } from '../../components/landing/LegalPage';
import { LEGAL } from '../../components/landing/legalDetails';

export const metadata = {
  title: 'Terms · NETZ',
  description: 'The rules for using NETZ, its free features and NETZ Pro.',
};

/** Terms of use (NETZ_LAUNCH_PLAN.md 5.3). */
export default function TermsPage() {
  const by = LEGAL.owner ? `${LEGAL.owner} ("we")` : 'us ("we")';
  return (
    <LegalPage title="Terms of use">
      <LegalSection title="Who we are">
        <P>NETZ is a maths learning app run by {by}. By using NETZ you agree to these terms. If you do not agree, please do not use it.</P>
      </LegalSection>

      <LegalSection title="Using NETZ">
        <P>
          The solvers, notes, Playground, handwriting, tasks, streaks, medals and gems are free. Most of your work is
          saved in your own browser; if you sign in with Google, your progress and notes are also copied to your
          account so they reach your other devices.
        </P>
        <P>
          NETZ shows worked steps to help you learn. Please check important answers yourself: we work hard to make the
          results right, but we cannot promise that every result is free of mistakes.
        </P>
        <P>You may not use NETZ to break the law, to attack or overload the service, or to get around limits or payments.</P>
      </LegalSection>

      <LegalSection title="Your notes">
        <P>
          Your notes are yours. When you publish a note, anyone with its link can read it and copy it into their own
          notes, until you unpublish it. Do not publish anything you do not have the right to share, or anything
          harmful or hateful. We may remove published notes that break these rules.
        </P>
      </LegalSection>

      <LegalSection title="Gems and shop items">
        <P>
          Gems are earned by doing tasks. They have no money value, cannot be bought, sold or swapped for money, and
          are only spent in the NETZ shop on banners, robot skins and streak freezes.
        </P>
      </LegalSection>

      <LegalSection title="NETZ Pro">
        <P>
          NETZ Pro is a paid plan, monthly, yearly or lifetime, shown with its price on the{' '}
          <Link href="/Pricing" style={linkStyle}>Pricing page</Link>. Payments are handled by Razorpay. Monthly and
          yearly plans renew automatically until you cancel; after cancelling, Pro stays on until the end of the
          period you paid for. Lifetime is paid once and lasts as long as NETZ runs.
        </P>
        <P>
          Pro rewards you earn (the year&apos;s banner, robot skin and Pro medal) are yours to keep after Pro ends.
          Refunds are described on the <Link href="/Refund" style={linkStyle}>Refund page</Link>.
        </P>
      </LegalSection>

      <LegalSection title="Changes and ending">
        <P>
          We may change NETZ, these terms or the prices. Changes to prices never affect a period you have already
          paid for, and we will show important changes in the app before they apply. You can stop using NETZ and
          delete your local data at any time from Settings.
        </P>
      </LegalSection>

      <LegalSection title="Liability">
        <P>
          NETZ is provided as it is. As far as the law allows, we are not liable for indirect losses, such as lost
          marks or lost work, and our total liability is limited to what you paid us in the last 12 months.
        </P>
        <P>
          These terms follow the laws of India
          {LEGAL.jurisdiction ? `, and disputes go to the courts of ${LEGAL.jurisdiction}` : ''}.
          For questions, email <ContactLine />.
        </P>
      </LegalSection>
    </LegalPage>
  );
}
