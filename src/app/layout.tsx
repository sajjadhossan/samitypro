import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SamityPro | সমিতিপ্রো — সমিতি, ক্লাব ও সংগঠন ব্যবস্থাপনা অ্যাপ',
  description: 'Complete, multi-tenant SaaS application for Samities, Clubs, Savings Groups, School Committees, and Social Organizations. Real-time sync, Web & Mobile APK ready.',
  keywords: ['সমিতি সফটওয়্যার', 'সমবায় সমিতি', 'Samity Software', 'Club Management', 'Microfinance', 'DPS Management', 'SamityPro'],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
