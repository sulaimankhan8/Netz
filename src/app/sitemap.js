import { LIVE_METHODS } from './data/methods';
import { SITE_URL as SITE } from './utils/seo/site';

// App pages; method pages come from the one methods list (src/app/data/methods.js)
const PAGES = [
  { path: '/', changeFrequency: 'daily', priority: 1.0 },
  { path: '/Algorithems', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/Home', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/Notes', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/Playground', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/Profile', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/Setting', changeFrequency: 'weekly', priority: 0.8 },
];

// The app pages change when the newest method page changes, so they take that date (not a fixed old one)
const NEWEST_LASTMOD = LIVE_METHODS.reduce((max, m) => (m.lastmod > max ? m.lastmod : max), '2024-10-01');

export default function sitemap() {
  return [
    ...PAGES.map((p) => ({
      url: `${SITE}${p.path === '/' ? '/' : p.path}`,
      lastModified: new Date(`${NEWEST_LASTMOD}T00:00:00+00:00`),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...LIVE_METHODS.map((m) => ({
      url: `${SITE}${m.route}`,
      lastModified: new Date(`${m.lastmod}T00:00:00+00:00`),
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  ];
}
