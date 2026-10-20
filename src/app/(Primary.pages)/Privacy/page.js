import LegalPage, { ContactLine, LegalSection, P, linkStyle } from '../../components/landing/LegalPage';
import { LEGAL } from '../../components/landing/legalDetails';

export const metadata = {
  title: 'Privacy · NETZ',
  description: 'What NETZ keeps on your device, what your account stores, and what analytics, ads and payments collect.',
};

/** Privacy notice, linked from the landing page footer and the other legal pages. */
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <LegalSection title="Your work stays on your device">
        <P>
          Playground pages, notes, settings, finished tours and your progress (tasks, streak, medals and gems) are
          saved in this browser&apos;s own storage. Clearing this site&apos;s data in your browser removes them.
        </P>
        <P>
          Handwriting is recognised on your device. The recognition models are downloaded once and kept by the
          browser so they also work offline.
        </P>
      </LegalSection>

      <LegalSection title="If you sign in">
        <P>
          Signing in is optional and uses Google. Your account then stores your name and email from Google, your
          robot&apos;s name, your progress, and a copy of up to 20 notes (more with Pro), so they reach your other
          devices. This is kept in a database run by Supabase, and the app is hosted by Vercel.
        </P>
        <P>
          A note you publish can be read by anyone with its link, together with your name, robot and medal count,
          until you unpublish it.
        </P>
        <P>To delete your account and everything stored with it, email <ContactLine />.</P>
      </LegalSection>

      <LegalSection title="Payments">
        <P>
          NETZ Pro is paid through Razorpay. Your card, UPI or bank details go to Razorpay, never to NETZ. We keep
          which plan you bought, when, the amount, and Razorpay&apos;s payment number, as the law requires for
          accounts and tax.
        </P>
      </LegalSection>

      <LegalSection title="Analytics">
        <P>
          NETZ uses Google Analytics and Vercel Analytics and Speed Insights to see which pages are used and how
          fast they load: for example pages visited, device and browser type, and approximate location derived
          from your IP address. Google Analytics uses cookies for this.
        </P>
      </LegalSection>

      <LegalSection title="Ads">
        <P>
          Free users see a few ads from Google (AdSense and Google Ad Manager): one on the home page, below the
          results on algorithm pages, in the algorithms list, at the end of the notes list and on your Profile.
          There are never ads in the Playground, inside a note you are editing, on Pricing, on shared notes, or
          for Pro. After about 15 minutes of active use, Google may show one full-screen ad when you change page,
          at most 4 a day. On your Profile you can choose to watch a short ad for gems, up to 3 a day.
        </P>
        <P>
          Google may use cookies to show and measure ads,
          including ads based on your visits to this and other sites. You can read how Google uses this data at{' '}
          <a href="https://policies.google.com/technologies/ads" style={linkStyle}>policies.google.com/technologies/ads</a>{' '}
          and turn off personalised ads at{' '}
          <a href="https://adssettings.google.com" style={linkStyle}>adssettings.google.com</a>.
        </P>
      </LegalSection>

      <LegalSection title="Questions">
        <P>
          {LEGAL.owner ? `NETZ is run by ${LEGAL.owner}. ` : ''}For anything about your data, email <ContactLine />.
        </P>
      </LegalSection>
    </LegalPage>
  );
}
