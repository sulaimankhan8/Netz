import LegalPage, { ContactLine, LegalSection, P } from '../../components/landing/LegalPage';

export const metadata = {
  title: 'Refunds and cancelling · NETZ',
  description: 'NETZ Pro is not refunded; you can cancel any time and keep Pro until the paid period ends.',
};

/** Refund and cancellation policy (NETZ_LAUNCH_PLAN.md 5.3). Owner's choice, 2026-10-21: no refunds, cancel any time. */
export default function RefundPage() {
  return (
    <LegalPage title="Refunds and cancelling">
      <LegalSection title="No refunds">
        <P>
          Payments for NETZ Pro (monthly, yearly or lifetime) are not refunded, including when you cancel part way through
          a period. Everything in NETZ is free to try before you pay, so please check it suits you first.
        </P>
        <P>
          The one exception: if you were charged twice or by mistake, email <ContactLine /> from the email of your NETZ
          account with the date of the payment and we refund the extra payment. Razorpay sends it back to the same card,
          UPI account or bank you paid with, usually within 5–7 working days.
        </P>
      </LegalSection>

      <LegalSection title="Cancel any time">
        <P>
          You can cancel a monthly or yearly plan from your Profile whenever you like. Nothing more is charged, and Pro
          stays on until the end of the period you have paid for. Lifetime is a single payment, so there is nothing to cancel.
        </P>
        <P>Medals, banners and robot skins you earned with Pro are kept after Pro ends.</P>
      </LegalSection>

      <LegalSection title="Gems">
        <P>Gems are earned, never bought, so they cannot be refunded or turned into money.</P>
      </LegalSection>
    </LegalPage>
  );
}
