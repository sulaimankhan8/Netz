import { ImageResponse } from 'next/og';
import { LIVE_METHODS, UNITS, methodById } from '@/app/data/methods';
import { SITE_URL } from '@/app/utils/seo/site';

/**
 * The share picture for a method page (1200x630): what shows when the page's link is posted on LinkedIn, X,
 * WhatsApp or Slack. One card per method, drawn from the methods list (src/app/data/methods.js), so a new
 * method gets its picture with no extra work. methodMetadata() points the page at /og/<id>.
 */
export const dynamicParams = false;
export const contentType = 'image/png';

export function generateStaticParams() {
  return LIVE_METHODS.map((m) => ({ id: m.id }));
}

const YELLOW = '#facc15';

export async function GET(_request, { params }) {
  const { id } = await params;
  const m = methodById(id);
  if (!m) return new Response('Not found', { status: 404 });

  const unit = UNITS.find((u) => u.unit === m.unit);
  const unitLabel = unit ? unit.title : '';
  const nameSize = m.name.length > 34 ? 66 : m.name.length > 22 ? 80 : 96;
  const host = SITE_URL.replace(/^https?:\/\//, '');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#141414',
          padding: '64px 72px',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              background: YELLOW,
              color: '#141414',
              fontSize: 36,
              fontWeight: 800,
              padding: '8px 24px',
              borderRadius: 12,
              letterSpacing: 2,
            }}
          >
            NETZ
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: '#a3a3a3' }}>{unitLabel}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: nameSize, fontWeight: 800, lineHeight: 1.08 }}>{m.name}</div>
          <div style={{ display: 'flex', fontSize: 40, color: YELLOW, marginTop: 28 }}>
            Step-by-step solver, with a worked example
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 30, color: '#d4d4d4' }}>Free. Works on phone, tablet and laptop.</div>
          <div style={{ display: 'flex', fontSize: 30, color: '#a3a3a3' }}>{host}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
