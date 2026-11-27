import LegalPage, { ContactLine, LegalSection, P } from '../../components/landing/LegalPage';

export const metadata = {
  title: 'Refunds and cancelling · NETZ',
  description: 'No refunds for a change of mind, but double charges and Pro features that do not work are refunded. Cancel any time in one tap.',
};

/**
 * Refund and cancellation policy (docs/launch/NETZ_ROADMAP.md task 1.3, Indian consumer rules on subscription traps):
 * no refunds for a change of mind, except double charges and faults; cancelling is one tap on the Profile.
 * Before 2026-11-21 the page said "no refunds" with only the double-charge exception (owner's choice, 2026-10-21).
 */
export default function RefundPage() {
  return (
    <LegalPage title="Refunds and cancelling">
      <LegalSection title="No refunds for a change of mind">
        <P>
          Everything in NETZ is free to try before you pay, so please check it suits you first. Payments for NETZ Pro
          (monthly, yearly or lifetime) are not refunded if you simply change your mind, including when you cancel part
          way through a period.
        </P>
      </LegalSection>

      <LegalSection title="When we do refund">
        <P>
          <strong>Charged twice or by mistake.</strong> We refund the extra payment in full.
        </P>
        <P>
          <strong>Pro does not work.</strong> If a Pro feature you paid for does not work and we cannot fix it within
          7 days of you telling us, we refund the payment for the period it affected (for lifetime, the full payment
          if it is within the first 30 days).
        </P>
        <P>
          To ask, email <ContactLine /> from the email of your NETZ account, with the date of the payment and what went
          wrong. We reply within 2 working days. Razorpay sends the refund back to the same card, UPI account or bank you
          paid with, usually within 5–7 working days.
        </P>
      </LegalSection>

      <LegalSection title="Cancel any time, in one tap">
        <P>
          On your Profile, under Your plan, press <strong>Cancel renewal</strong>. That is all: nothing more is charged,
          and Pro stays on until the end of the period you have paid for. Lifetime is a single payment, so there is
          nothing to cancel.
        </P>
        <P>Medals, banners and robot skins you earned with Pro are kept after Pro ends.</P>
      </LegalSection>

      <LegalSection title="Gems">
        <P>Gems are earned, never bought, so they cannot be refunded or turned into money.</P>
      </LegalSection>
    </LegalPage>
  );
}
