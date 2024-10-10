
import Script from 'next/script';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import '../app/styles/globals.css';

import Head from 'next/head';
import Layout from '../app/components/layout'; // Ensure the spelling is correct (Layout vs. Laout)

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

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('Service worker registered:', registration);
    })
    .catch((error) => {
      console.error('Service worker registration failed:', error);
    });
}

export default function RootLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-LQZ77XP63Z', {
        page_path: router.asPath,
      });
    }
  }, [router.asPath]);


  return (
    <html lang="en">
      <Head>
     
<Script async src="https://www.googletagmanager.com/gtag/js?id=G-LQZ77XP63Z" strategy="afterInteractive"></Script>
<Script id="google-analytics" strategy="afterInteractive">{`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-LQZ77XP63Z');`}
</Script>
        <meta name="google-site-verification" content="WT9x6ycaN58WMURczi5-6Uk_pqt2_cvxkw2OIYN0ZPU" />
      </Head>
      <body>
        <Layout />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
