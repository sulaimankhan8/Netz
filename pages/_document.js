// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Link to manifest.json */}
        <link rel="manifest" href="/manifest.json" />
        {/* Set theme color for the PWA */}
        <meta name="theme-color" content="#ffffff" />
        {/* Apple touch icon for iOS */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Meta description for your app */}
        <meta name="description" content="A Next.js app for numerical algorithms and methods." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
