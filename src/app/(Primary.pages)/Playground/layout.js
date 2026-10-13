export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata = {
  title: 'Playground | NETZ',
  description: 'Infinite handwriting whiteboard with on-device math and text recognition',
};

export default function PlaygroundLayout({ children }) {
  return children;
}
