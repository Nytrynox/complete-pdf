import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://completepdf.tech'),
  title: {
    default: 'Complete PDF - Free Online PDF Editor | Edit, Convert, Merge, Sign PDFs',
    template: '%s | Complete PDF'
  },
  description: 'Complete PDF is a 100% free online PDF editor with 50+ professional tools. Edit, convert, merge, split, compress, sign, and protect your PDF files online. No registration required. All processing happens in your browser - your files never leave your device.',
  keywords: [
    'PDF editor',
    'free PDF tools',
    'merge PDF',
    'split PDF',
    'compress PDF',
    'convert PDF',
    'PDF to Word',
    'Word to PDF',
    'sign PDF',
    'edit PDF online',
    'PDF converter',
    'online PDF editor',
    'free PDF editor',
    'PDF tools online',
    'secure PDF editor',
    'privacy-first PDF',
    'no upload PDF editor'
  ],
  authors: [{ name: 'Karthik Idikuda', url: 'https://www.karthikidikuda.dev' }],
  creator: 'Karthik Idikuda',
  publisher: 'Complete PDF',
  category: 'Technology',
  classification: 'PDF Tools',
  applicationName: 'Complete PDF',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://completepdf.tech',
    siteName: 'Complete PDF',
    title: 'Complete PDF - Free Online PDF Editor',
    description: 'Edit, convert, merge, split, compress, sign PDFs online for free. 50+ professional PDF tools. 100% secure - files never leave your browser.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Complete PDF - Free Online PDF Editor with 50+ Tools',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Complete PDF - Free Online PDF Editor',
    description: 'Edit, convert, merge, split, compress, sign PDFs online for free. 50+ professional PDF tools. 100% secure.',
    images: ['/og-image.png'],
    creator: '@karthikidikuda',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://completepdf.tech',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://completepdf.tech" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Complete PDF" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Complete PDF',
              description: 'Free online PDF editor with 50+ professional tools. Edit, convert, merge, split, compress, sign PDFs securely in your browser.',
              url: 'https://completepdf.tech',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Any',
              browserRequirements: 'Requires JavaScript. Requires HTML5.',
              softwareVersion: '1.0.0',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              author: {
                '@type': 'Person',
                name: 'Karthik Idikuda',
                url: 'https://www.karthikidikuda.dev',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '1000',
                bestRating: '5',
                worstRating: '1'
              },
              featureList: [
                'Edit PDF',
                'Merge PDF',
                'Split PDF',
                'Compress PDF',
                'Convert PDF to Word',
                'Convert Word to PDF',
                'Sign PDF',
                'Protect PDF',
                'Unlock PDF',
                'Rotate PDF',
                'Add Watermark'
              ]
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Complete PDF',
              url: 'https://completepdf.tech',
              logo: 'https://completepdf.tech/logo.png',
              sameAs: [
                'https://github.com/Nytrynox/landing-page',
                'https://www.linkedin.com/in/karthik129259/'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'idikudakarthik55@gmail.com',
                contactType: 'customer support'
              }
            }),
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
