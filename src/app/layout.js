
 
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import Head from 'next/head';
import Laout from './components/layout';




export const metadata = {
  title: "netz",
  verification: {
    google: 'WT9x6ycaN58WMURczi5-6Uk_pqt2_cvxkw2OIYN0ZPU',
   
    },
  description: "current objective :survive",
  icons:{
     icon:['/favicon.ico?v=4'],
     apple:['/apple-touch-icon.png?v=4'],
     shortcut:['/apple-touch-icon.png']
  }
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <Head><meta name="google-site-verification" content="WT9x6ycaN58WMURczi5-6Uk_pqt2_cvxkw2OIYN0ZPU" /></Head>
      <body>
       <Laout/>
        {children}
        
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
