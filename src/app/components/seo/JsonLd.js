/**
 * Structured data for search engines and AI assistants, as a plain <script> (Next.js JSON-LD guide).
 * "<" is escaped so text in the data can't close the script tag.
 */
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
