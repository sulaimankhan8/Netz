
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import '../app/styles/globals.css';

import Layout from '../app/components/layout'; // Ensure the spelling is correct (Layout vs. Laout)
import Script from 'next/script';

const APP_NAME = "Netz";
const APP_DEFAULT_TITLE = "NETZ";

const APP_TITLE_TEMPLATE = "%s";
const APP_DESCRIPTION = "current objective :survive";

export const metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
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
  verification: {
    google: 'WT9x6ycaN58WMURczi5-6Uk_pqt2_cvxkw2OIYN0ZPU',
  },
  icons: {
    icon: ['/favicon.ico?v=4'],
    apple: ['/apple-touch-icon.png?v=4'],
    shortcut: ['/apple-touch-icon.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><Script async src="https://www.googletagmanager.com/gtag/js?id=G-MH5QX2N0Q0"></Script>
<Script id="netz"> {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-MH5QX2N0Q0');`}
</Script>
        <meta name="google-site-verification" content="WT9x6ycaN58WMURczi5-6Uk_pqt2_cvxkw2OIYN0ZPU" />
        <meta name="google-adsense-account" content="ca-pub-3746721364737268">
        </head>
      <body>
        <Layout />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}