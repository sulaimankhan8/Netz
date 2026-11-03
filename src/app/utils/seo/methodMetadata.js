import { methodById } from '../../data/methods';
import { SITE_NAME, SITE_URL } from './site';

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
    },
    twitter: { card: 'summary', title: fullTitle, description: m.description },
    // Pages still being built stay out of search results
    ...(m.status === 'live' ? {} : { robots: { index: false, follow: false } }),
  };
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
