import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { clsx } from 'clsx'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: {
    default: 'Net Seller Sheet | Real Estate Proceeds Calculator',
    template: '%s | Net Seller Sheet'
  },
  description: 'The #1 Free Home Seller Tool. Calculate exactly what you verify walk away with when selling your home. Accurate estimates for commissions, title fees, and closing costs.',
  keywords: [
    "Net Seller Sheet",
    "Seller Net Sheet",
    "Home Seller Tools",
    "Walk Away With Calculator",
    "Home Sale Proceeds Calculator",
    "Real Estate Closing Costs",
    "Seller Closing Costs"
  ],
  openGraph: {
    title: 'Net Seller Sheet - Know Your Numbers',
    description: 'Calculate your true net proceeds. See exactly what you walk away with after commissions and fees.',
    url: 'https://netsellersheet.com',
    siteName: 'Net Seller Sheet',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-share.png', // We need to generate this or use a placeholder
        width: 1200,
        height: 630,
        alt: 'Net Seller Sheet Calculator Interface'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Net Seller Sheet Calculator',
    description: 'Stop guessing. Calculate your exact home sale proceeds in seconds.',
  },
  alternates: {
    canonical: 'https://netsellersheet.com'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={clsx(outfit.className, "min-h-screen bg-slate-950 font-sans")}>
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
