import { methodById } from '../../data/methods';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './site';

/**
 * Next.js metadata for one method page, from the methods list (src/app/data/methods.js).
 * Used by the small server layout.js next to each method's page.js:
 *   export const metadata = methodMetadata('newton-raphson');
 */
export function methodMetadata(id) {
  const m = methodById(id);
  if (!m) throw new Error(`methodMetadata: unknown method id "${id}"`);
  // The layout's title template adds " — NETZ" to these titles
  const fullTitle = m.title;
  // The share picture is drawn per method by src/app/og/[id]/route.js
  const shareImage = { url: `/og/${m.id}`, width: 1200, height: 630, alt: `${m.name} on ${SITE_NAME}` };
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: m.route },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: fullTitle,
      description: m.description,
      url: m.route,
      images: [shareImage],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description: m.description, images: [shareImage.url] },
    // Pages still being built stay out of search results
    ...(m.status === 'live' ? {} : { robots: { index: false, follow: false } }),
  };
}

/**
 * Structured data for the home page: the site's name (WebSite) and who runs it (Organization, with the logo).
 * Google's math-solver result (MathSolver + SolveMathAction) is left out on purpose: it needs a URL that solves an
 * expression passed in it (e.g. /solve?q=…), and the calculators read their inputs on the page instead
 * (docs/launch/NETZ_ROADMAP.md F7).
 */
export function siteJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icons/icon-512x512.png`,
    },
  ];
}

/** Structured data for one method page: where it sits (BreadcrumbList) and what it teaches (LearningResource). */
export function methodJsonLd(id) {
  const m = methodById(id);
  if (!m) throw new Error(`methodJsonLd: unknown method id "${id}"`);
  const url = `${SITE_URL}${m.route}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Algorithms', item: `${SITE_URL}/Algorithems` },
        { '@type': 'ListItem', position: 3, name: m.name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: m.title,
      description: m.description,
      url,
      inLanguage: 'en',
      learningResourceType: 'Calculator',
      teaches: m.name,
      keywords: m.searchWords.join(', '),
      isAccessibleForFree: true,
      provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    },
  ];
}
