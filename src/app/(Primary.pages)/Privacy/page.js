import Link from 'next/link';
import LegalPage, { ContactLine, LegalSection, P, linkStyle } from '../../components/landing/LegalPage';
import { LEGAL } from '../../components/landing/legalDetails';

export const metadata = {
  title: 'Privacy · NETZ',
  description: 'What NETZ keeps on your device and in your account, why, who processes it, how long it is kept, your rights, and how to delete your account.',
};

/**
 * Privacy notice (docs/launch/NETZ_ROADMAP.md task 1.2: India's Digital Personal Data Protection Act 2023 basics).
 * Linked from the landing page footer and the other legal pages. Rewritten 2026-11-21: what and why, processors,
 * retention, rights, the in-app account deletion, a grievance contact and the breach plan.
 * Not covered yet: users under 18 (the owner's decision, roadmap 0.4 / 1.1).
 */
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <LegalSection title="In short">
        <P>
          You can use NETZ without an account, and then your work never leaves your device. If you sign in, we keep only
          what is needed to sync your work and progress, and to run Pro. You can delete your account yourself, in one
          place on your Profile, at any time.
        </P>
      </LegalSection>

      <LegalSection title="On your device">
        <P>
          Playground pages, notes, settings, finished tours and your progress (tasks, streak, medals and gems) are saved
          in this browser&apos;s own storage. Handwriting is recognised on your device; the recognition models are
          downloaded once and kept by the browser so they also work offline. Clearing this site&apos;s data in your
          browser removes all of it.
        </P>
      </LegalSection>

      <LegalSection title="If you sign in, and why">
        <P>Signing in is optional and uses Google. Your account then keeps:</P>
        <ul style={{ margin: '0 0 12px 20px', padding: 0, lineHeight: 1.6 }}>
          <li>your name and email from Google, to know it is you and to answer you;</li>
          <li>your robot&apos;s name and your progress, so they follow you to your other devices;</li>
          <li>a copy of up to 20 notes (more with Pro) and the files you add to them, for the same reason;</li>
          <li>notes you choose to publish, which anyone with the link can read, with your name, robot and medal count, until you unpublish them;</li>
          <li>if you buy Pro, your plan, its dates and Razorpay&apos;s payment number, to give you Pro.</li>
        </ul>
        <P>We use this only to run NETZ for you. We do not sell it, and we do not use your notes to train anything.</P>
      </LegalSection>

      <LegalSection title="Payments">
        <P>
          NETZ Pro is paid through Razorpay. Your card, UPI or bank details go to Razorpay, never to NETZ. We keep a record
          of each payment (plan, date, amount and Razorpay&apos;s payment number) for as long as Indian tax and accounting
          law requires, usually 6 to 8 years, even after you delete your account.
        </P>
      </LegalSection>

      <LegalSection title="Analytics and ads">
        <P>
          NETZ uses Google Analytics and Vercel Analytics and Speed Insights to see which pages are used and how fast they
          load: for example pages visited, device and browser type, and approximate location derived from your IP address.
          Google Analytics uses cookies for this.
        </P>
        <P>
          Free users see a few ads from Google (AdSense and Google Ad Manager): one on the home page, below the results on
          algorithm pages, in the algorithms list, at the end of the notes list and on your Profile. There are never ads in
          the Playground, inside a note you are editing, on Pricing, on shared notes, or for Pro. After about 15 minutes of
          active use, Google may show one full-screen ad when you change page, at most 4 a day. On your Profile you can
          choose to watch a short ad for gems, up to 3 a day.
        </P>
        <P>
          Google may use cookies to show and measure ads, including ads based on your visits to this and other sites. You
          can read how Google uses this data at{' '}
          <a href="https://policies.google.com/technologies/ads" style={linkStyle}>policies.google.com/technologies/ads</a>{' '}
          and turn off personalised ads at{' '}
          <a href="https://adssettings.google.com" style={linkStyle}>adssettings.google.com</a>.
        </P>
      </LegalSection>

      <LegalSection title="Who handles your data">
        <P>
          Supabase (the account database and file storage), Vercel (hosting and analytics), Razorpay (payments) and Google
          (sign-in, analytics and ads) process data for NETZ under their own privacy terms. Their servers may be outside
          India.
        </P>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <P>
          Your account and everything in it are kept until you delete your account. Deleting removes them straight away
          from the live database and storage; the services&apos; own backups roll over within about 30 days. Payment
          records are kept for the tax period above. Data in your browser stays until you clear it.
        </P>
      </LegalSection>

      <LegalSection title="Your rights">
        <P>
          You can ask what we hold about you, have it corrected, have it deleted, withdraw your consent (by deleting your
          account or signing out and clearing this site&apos;s data), and name someone to act for you if you cannot. Write
          to the contact below.
        </P>
        <P>
          <strong>Delete your account yourself:</strong> on your <Link href="/Profile" style={linkStyle}>Profile</Link>,
          press <strong>Delete my account</strong> and confirm. It stops a Pro plan renewing, then removes your account,
          your cloud notes and files, your published notes and your saved progress. You can also email us to do it.
        </P>
      </LegalSection>

      <LegalSection title="Keeping it safe, and if something goes wrong">
        <P>
          Data travels over HTTPS. Account data sits behind database rules so each person can reach only their own, and
          payment keys stay on the server. If a breach ever affects your personal data, we will tell you without delay:
          what happened, what it means for you and what we are doing about it. We will also report it to the Data
          Protection Board of India, as the law requires.
        </P>
      </LegalSection>

      <LegalSection title="Questions and complaints">
        <P>
          {LEGAL.owner ? `NETZ is run by ${LEGAL.owner}, who also answers privacy questions and complaints. ` : ''}Email{' '}
          <ContactLine />. We reply within 7 days and aim to resolve every complaint within 30 days. If you are not
          satisfied with our answer, you can complain to the Data Protection Board of India.
        </P>
      </LegalSection>
    </LegalPage>
  );
}
