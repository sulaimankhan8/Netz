/**
 * Which AdSense account NETZ uses. Nothing is hard-coded: the owner sets the publisher id and the ad
 * unit ids in .env.local and Vercel (NETZ_OWNER_TODO.md section H). While NEXT_PUBLIC_ADSENSE_CLIENT is
 * empty there is no AdSense tag, no script, no ad boxes and an empty ads.txt.
 */

/** "pub-1234…" or "ca-pub-1234…" → "ca-pub-1234…", or '' when it is not a publisher id. */
export function normaliseClient(value) {
  const raw = String(value || '').trim();
  const digits = raw.match(/^(?:ca-)?pub-(\d{10,20})$/);
  return digits ? `ca-pub-${digits[1]}` : '';
}

export const AD_CLIENT = normaliseClient(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);
export const ADSENSE_ON = Boolean(AD_CLIENT);

const clean = (v) => (/^\d{6,20}$/.test(String(v || '').trim()) ? String(v).trim() : '');

// One ad unit per place; a place without its own unit uses the landing unit
const SLOTS = {
  landing: clean(process.env.NEXT_PUBLIC_ADSENSE_SLOT_LANDING),
  algorithm: clean(process.env.NEXT_PUBLIC_ADSENSE_SLOT_ALGORITHM),
  hub: clean(process.env.NEXT_PUBLIC_ADSENSE_SLOT_HUB),
  notes: clean(process.env.NEXT_PUBLIC_ADSENSE_SLOT_NOTES),
  profile: clean(process.env.NEXT_PUBLIC_ADSENSE_SLOT_PROFILE),
};

/** The ad unit id for a place, or '' when there is none yet (then that place shows no ad box). */
export function adSlotFor(place) {
  if (!ADSENSE_ON) return '';
  return SLOTS[place] || SLOTS.landing;
}

/**
 * The text of /ads.txt: the AdSense line for this account, plus any extra lines Google gives the owner
 * (Ad Manager), one per line in NEXT_PUBLIC_ADS_TXT_EXTRA (separated by "|" or new lines).
 */
export function adsTxt(client = AD_CLIENT, extra = process.env.NEXT_PUBLIC_ADS_TXT_EXTRA) {
  const lines = [];
  if (client) lines.push(`google.com, ${client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0`);
  String(extra || '')
    .split(/\||\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((l) => lines.push(l));
  return lines.length ? `${lines.join('\n')}\n` : '# No ad accounts are set up yet.\n';
}
