import type { Metadata } from 'next';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';
import Script from 'next/script';

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
    <html lang="en">
      <head>
        {/* Google Analytics 4 */}
        <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "clarity_id_here");
          `}
        </Script>

        {/* LocalBusiness JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Sangli Ceramica",
              "image": "https://ceramicapremiumtiles.vercel.app/logo.png",
              "url": "https://ceramicapremiumtiles.vercel.app",
              "telephone": "+919876543210",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Main Market Road",
                "addressLocality": "Sangli",
                "addressRegion": "Maharashtra",
                "postalCode": "416416",
                "addressCountry": "IN"
              }
            })
          }}
        />
      </head>
      <body className="antialiased bg-dark-black text-white min-h-screen flex flex-col font-sans">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
