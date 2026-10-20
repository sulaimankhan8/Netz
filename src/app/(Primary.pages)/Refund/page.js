import LegalPage, { ContactLine, LegalSection, P } from '../../components/landing/LegalPage';
import { LEGAL } from '../../components/landing/legalDetails';

export const metadata = {
  title: 'Refunds and cancelling · NETZ',
  description: 'How refunds and cancelling NETZ Pro work.',
};

/** Refund and cancellation policy (NETZ_LAUNCH_PLAN.md 5.3). */
export default function RefundPage() {
  const days = LEGAL.refundDays;
  return (
    <LegalPage title="Refunds and cancelling">
      <LegalSection title={`Full refund within ${days} days`}>
        <P>
          If NETZ Pro is not right for you, ask for a refund within {days} days of your first payment for a plan
          (monthly, yearly or lifetime) and you get the whole amount back. Pro then ends straight away.
        </P>
        <P>
          Renewals of a monthly or yearly plan are not refunded, but you can cancel before the next renewal at any time.
          If you were charged twice or by mistake, tell us and we refund the extra payment.
        </P>
      </LegalSection>

      <LegalSection title="How to ask">
        <P>
          Email <ContactLine /> from the email of your NETZ account, with the date of the payment. Approved refunds are
          sent back by Razorpay to the same card, UPI account or bank you paid with, usually within 5–7 working days.
        </P>
      </LegalSection>

      <LegalSection title="Cancelling">
        <P>
          You can cancel a monthly or yearly plan from your Profile. Nothing more is charged, and Pro stays on until the
          end of the period you have paid for. Lifetime is a single payment, so there is nothing to cancel.
        </P>
        <P>Medals, banners and robot skins you earned with Pro are kept after Pro ends.</P>
      </LegalSection>

      <LegalSection title="Gems">
        <P>Gems are earned, never bought, so they cannot be refunded or turned into money.</P>
      </LegalSection>
    </LegalPage>
  );
}
