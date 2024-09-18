import { Analytics } from '@vercel/analytics/react';
import "./globals.css";


export const metadata = {
  title: "netz",
  description: "current objective :survive",

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
