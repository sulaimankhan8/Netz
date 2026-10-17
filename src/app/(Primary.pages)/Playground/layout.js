// The Playground's design tokens (colours, shadows) as CSS variables
import './playground.css';

// The page itself is not limited to 100% zoom (people who need larger text can still zoom); a
// pinch on the whiteboard zooms the whiteboard, because the page sets touch-action: none.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata = {
  title: 'Playground | NETZ',
  description: 'Infinite handwriting whiteboard with on-device math and text recognition',
};

export default function PlaygroundLayout({ children }) {
  return children;
}
