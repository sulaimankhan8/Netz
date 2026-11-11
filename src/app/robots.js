import { SITE_URL } from './utils/seo/site';

// Search engines and the AI assistants' crawlers, named so it is plain that NETZ welcomes them (roadmap F6).
// Every bot may read every page; pages still being built carry their own noindex (utils/seo/methodMetadata.js).
const AI_AND_SEARCH = [
  'Googlebot', 'Google-Extended', 'Bingbot',
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot',
];

export default function robots() {
  return {
    rules: [
      ...AI_AND_SEARCH.map((userAgent) => ({ userAgent, allow: '/' })),
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
