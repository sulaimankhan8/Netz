// app/layout.js

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../styles/globals.css";
import "./alg.css";
import Script from 'next/script';
import Laout from '../components/layout'; // Ensure the spelling is correct (Layout vs. Laout)
import AdsenseScript from '../components/AdsenseScript';
import { AD_CLIENT } from '../utils/ads/adsenseConfig';
import TimedAds from '../components/ads/TimedAds';

const APP_NAME = "Netz";
const APP_DEFAULT_TITLE = "NETZ";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "Best PWA app in the world!";

export const metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  verification: {
    google: 'WT9x6ycaN58WMURczi5-6Uk_pqt2_cvxkw2OIYN0ZPU',
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  description: "current objective: survive", // Moved here for clarity
  icons: {
    icon: [
      { url: '/favicon.ico?v=6', sizes: 'any' },
      { url: '/icons/favicon.svg?v=6', type: 'image/svg+xml' },
      { url: '/icons/icon-16x16.png?v=6', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png?v=6', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-48x48.png?v=6', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-96x96.png?v=5', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-192x192.png?v=5', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png?v=5', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=5', sizes: '180x180' },
      { url: '/icons/icon-152x152.png?v=5', sizes: '152x152' },
      { url: '/icons/icon-167x167.png?v=5', sizes: '167x167' },
    ],
    shortcut: ['/favicon.ico?v=6'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        {/* Dark is the default theme; only a saved "light" choice turns it off. Runs before the first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.getItem('theme')!=='light')document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}",
          }}
        />
<Script async src="https://www.googletagmanager.com/gtag/js?id=G-MH5QX2N0Q0"></Script>
<Script id="netz"> {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-MH5QX2N0Q0');`}
</Script>
        <meta name="google-site-verification" content="WT9x6ycaN58WMURczi5-6Uk_pqt2_cvxkw2OIYN0ZPU" />
        {AD_CLIENT && <meta name="google-adsense-account" content={AD_CLIENT} />}
        </head>
      <body>
        {/* Ads load when idle, only where allowed, never for Pro; the full-screen ad waits 15 active minutes */}
        <AdsenseScript />
        <TimedAds />
        <Laout>
          {children}
        </Laout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
