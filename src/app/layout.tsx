import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeadActions from '@/components/LeadActions';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ceramica Premium Tiles | Luxury Ceramic & Vitrified Tiles Website',
  description: 'Experience luxury living with Ceramica Premium Tiles. Crafted for modern homes, high-end architects, and upscale commercial spaces. Explore marble, wood, and stone tiles.',
  metadataBase: new URL('https://ceramicapremiumtiles.vercel.app'),
  openGraph: {
    title: 'Ceramica Premium Tiles | Luxury Ceramic & Vitrified Tiles',
    description: 'Transform spaces with premium Italian marble finishes and custom vitrified slabs.',
    url: 'https://ceramicapremiumtiles.vercel.app',
    siteName: 'Ceramica Premium Tiles',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Ceramica Premium Tiles Showcase',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ceramica Premium Tiles',
    description: 'Luxury vitrified and marble collections designed for elite architecture.',
    images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased bg-dark-black text-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <LeadActions />
      </body>
    </html>
  );
}
