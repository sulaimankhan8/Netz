import { Analytics } from '@vercel/analytics/react';
import "./globals.css";


export const metadata = {
  title: "netz",
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
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
