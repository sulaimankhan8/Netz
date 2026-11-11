// Title, description and structured data for this page, from src/app/data/methods.js
import { methodMetadata, methodJsonLd } from '@/app/utils/seo/methodMetadata';
import JsonLd from '@/app/components/seo/JsonLd';

export const metadata = methodMetadata('corporate-tax-calculator');

export default function Layout({ children }) {
  return (
    <>
      <JsonLd data={methodJsonLd('corporate-tax-calculator')} />
      {children}
    </>
  );
}
