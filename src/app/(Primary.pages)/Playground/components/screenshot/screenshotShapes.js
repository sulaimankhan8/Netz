/**
 * The four screenshot shapes, with WPS Office's names, and their dashed outline icons (20 × 20).
 * Shared by the Screenshot menu and the screenshot editor's toolbar.
 */
export const SHAPE_CHOICES = [
  { id: 'rect', label: 'Rectangle Screenshot', d: 'M3 5h14v10H3z' },
  { id: 'oval', label: 'Oval Screenshot', d: 'M10 4.5c4 0 7 2.5 7 5.5s-3 5.5-7 5.5S3 13 3 10s3-5.5 7-5.5z' },
  { id: 'rounded', label: 'Rounded rectangle screenshot', d: 'M6 5h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z' },
  { id: 'polygon', label: 'Polygon screenshot', d: 'M10 3l7 5-3 8H6L3 8z' },
];

export function ShapeOutlineIcon({ d, className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.5 2" />
    </svg>
  );
}
