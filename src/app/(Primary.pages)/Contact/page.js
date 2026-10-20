import LegalPage, { LegalSection, P, linkStyle } from '../../components/landing/LegalPage';
import { LEGAL } from '../../components/landing/legalDetails';

export const metadata = {
  title: 'Contact · NETZ',
  description: 'How to reach the people behind NETZ.',
};

/** Contact page (NETZ_LAUNCH_PLAN.md 5.3). Details come from legalDetails.js. */
export default function ContactPage() {
  const rows = [
    ['Run by', LEGAL.owner],
    ['Email', LEGAL.email && <a href={`mailto:${LEGAL.email}`} style={linkStyle}>{LEGAL.email}</a>],
    ['Address', LEGAL.address],
  ].filter(([, value]) => value);

  return (
    <LegalPage title="Contact">
      <LegalSection title="Get in touch">
        <P>
          Questions about NETZ, a payment, a refund, or a public note that should come down: write to us and we
          reply within 2 working days.
        </P>
        {rows.length > 0 ? (
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '8px 20px', fontSize: 16, lineHeight: '26px' }}>
            {rows.map(([label, value]) => (
              <div key={label} style={{ display: 'contents' }}>
                <dt style={{ fontWeight: 700 }}>{label}</dt>
                <dd style={{ margin: 0, color: 'var(--ld-text2)', whiteSpace: 'pre-line' }}>{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <P>Contact details are being added.</P>
        )}
      </LegalSection>

      <LegalSection title="Payments">
        <P>For a payment, please include the date and the email of your NETZ account so we can find it quickly.</P>
      </LegalSection>
    </LegalPage>
  );
}
