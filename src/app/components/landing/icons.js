/**
 * Small stroke icons for the landing page, drawn inline so the page needs no icon library.
 * Every icon is decorative (aria-hidden); the text next to it carries the meaning.
 */
function Svg({ size = 18, strokeWidth = 2, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconArrow = (p) => <Svg {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Svg>;
export const IconDownload = (p) => <Svg {...p}><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></Svg>;
export const IconReplay = (p) => <Svg {...p}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></Svg>;
export const IconCheck = (p) => <Svg strokeWidth={2.4} {...p}><path d="m5 12 5 5 9-10" /></Svg>;
export const IconPen = (p) => <Svg {...p}><path d="M4 20l4-1 11-11-3-3L5 16z" /></Svg>;
export const IconEraser = (p) => <Svg {...p}><path d="M7 21h10" /><path d="M5 15 15 5l4 4-10 10H5z" /></Svg>;
export const IconCalc = (p) => (
  <Svg {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M8 7h8" />
    <path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01M16 18h.01" />
  </Svg>
);
export const IconShapes = (p) => <Svg {...p}><rect x="3" y="3" width="8" height="8" rx="1.5" /><circle cx="17" cy="17" r="4" /><path d="m14 4 6 6" /></Svg>;
export const IconSquare = (p) => <Svg {...p}><rect x="4" y="4" width="16" height="16" rx="2" /></Svg>;
export const IconCircle = (p) => <Svg {...p}><circle cx="12" cy="12" r="8" /></Svg>;
export const IconArrowUpRight = (p) => <Svg {...p}><path d="M5 19 19 5" /><path d="M10 5h9v9" /></Svg>;
export const IconCrop = (p) => <Svg {...p}><path d="M6 2v14h14" /><path d="M2 6h14v14" /></Svg>;
export const IconNote = (p) => <Svg {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /><path d="M8 13h8M8 17h5" /></Svg>;
export const IconQuiz = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14" /><path d="M12 17h.01" /></Svg>;
export const IconSearch = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Svg>;
export const IconSteps = (p) => <Svg {...p}><circle cx="6" cy="6" r="2" /><circle cx="18" cy="12" r="2" /><circle cx="6" cy="18" r="2" /><path d="M8 7l8 4M8 17l8-4" /></Svg>;
export const IconSun = (p) => <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></Svg>;
export const IconMoon = (p) => <Svg {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></Svg>;
export const IconPhone = (p) => <Svg {...p}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></Svg>;
export const IconWifiOff = (p) => <Svg {...p}><path d="M2 8.8a15 15 0 0 1 20 0" /><path d="M8.5 16a5 5 0 0 1 7 0" /><path d="M3 3l18 18" /></Svg>;
export const IconUser = (p) => <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></Svg>;
export const IconGraph = (p) => <Svg {...p}><path d="M3 20h18" /><path d="M4 16l5-6 4 3 6-8" /></Svg>;
export const IconTable = (p) => <Svg {...p}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16M12 4v16" /></Svg>;
export const IconHand = (p) => (
  <Svg {...p}>
    <path d="M9 11V5a2 2 0 0 1 4 0v6" />
    <path d="M13 10a2 2 0 0 1 4 0v3a7 7 0 0 1-7 7 6 6 0 0 1-5-3l-2-4a1.5 1.5 0 0 1 2.6-1.5L7 13V8a2 2 0 0 1 2-2" />
  </Svg>
);
export const IconLock = (p) => <Svg {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Svg>;
