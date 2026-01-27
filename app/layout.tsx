import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { clsx } from 'clsx'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://netsellersheet.com'),
  title: {
    default: 'Real Estate Proceeds Calculator for Sellers | Net Seller Sheet',
    template: '%s | Net Seller Sheet'
  },
  description: 'The #1 Free Home Seller Tool. Calculate exactly what you walk away with when selling your home. Accurate estimates for commissions, title fees, closing costs, and mortgage payoffs.',
  keywords: [
    // Core Brand Keywords
    "Net Seller Sheet",
    "Seller Net Sheet",
    "Home Seller Tools",
    // High-Intent Long Tail Keywords  
    "Walk Away With Calculator",
    "Home Sale Proceeds Calculator",
    "Real Estate Proceeds Calculator",
    "Seller Closing Costs Calculator",
    // Mortgage/Buyer Keywords (Content Gap Strategy)
    "Mortgage Calculator for Home Sellers",
    "Down Payment Calculator",
    "Home Buying Power Calculator",
    "Seller Net to Buyer Down Payment",
    // Local/Niche Keywords
    "Real Estate Closing Costs",
    "Title Insurance Calculator",
    "Commission Calculator Real Estate"
  ],
  openGraph: {
    title: 'Net Seller Sheet - Know Your Numbers Before You Sell',
    description: 'Calculate your true net proceeds. See exactly what you walk away with after commissions, closing costs, and mortgage payoffs.',
    url: 'https://netsellersheet.com',
    siteName: 'Net Seller Sheet',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-share.png',
        width: 1200,
        height: 630,
        alt: 'Net Seller Sheet - Real Estate Proceeds Calculator'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Net Seller Sheet | Real Estate Proceeds Calculator',
    description: 'Stop guessing. Calculate your exact home sale proceeds in seconds. Free tool for home sellers.',
  },
  alternates: {
    canonical: 'https://netsellersheet.com'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* JSON-LD Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Net Seller Sheet",
              "url": "https://netsellersheet.com",
              "logo": "https://netsellersheet.com/logo.png",
              "description": "Free real estate proceeds calculator for home sellers. Calculate your net proceeds after commissions, closing costs, and mortgage payoffs.",
              "sameAs": []
            })
          }}
        />
        {/* JSON-LD WebSite Schema for Sitelinks Search Box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Net Seller Sheet",
              "url": "https://netsellersheet.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://netsellersheet.com/?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={clsx(outfit.className, "min-h-screen bg-slate-950 font-sans")}>
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
