import { adsTxt } from '../utils/ads/adsenseConfig';

// /ads.txt, written from the owner's ad settings (utils/ads/adsenseConfig.js), so a new AdSense
// account needs no code change
export const dynamic = 'force-static';

export function GET() {
  return new Response(adsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
