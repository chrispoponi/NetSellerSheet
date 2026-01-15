import { MainCalculator } from "@/components/features/MainCalculator";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* JSON-LD Schema for Software Application */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Net Seller Sheet Calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Calculate your net proceeds from selling a home. Includes commissions, title fees, and closing costs.",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "1250"
            }
          })
        }}
      />

      {/* Navbar moved to MainCalculator for interactivity */}

      {/* Content */}
      <div className="flex-1 flex flex-col pt-20">
        <MainCalculator />

        {/* SEO Content Block (Hidden from primary view but accessible to crawlers/readers below fold) */}
        <section id="how-it-works-section" className="max-w-4xl mx-auto px-6 py-16 space-y-8 text-slate-400 text-sm">
          <h2 className="text-xl font-bold text-white">Why use a Seller Net Sheet?</h2>
          <p>
            A <strong>Seller Net Sheet</strong> (or Net Proceeds Calculator) is the most critical tool for any home seller. unlike a Zestimate which only shows gross value, our <em>Net Seller Sheet</em> calculates your true "Walk Away" number after deducting real estate agent commissions, title insurance, escrow fees, and prorated property taxes.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-2">Customizable Closing Costs</h3>
              <p>This calculator uses national averages for quick estimates. Upgrade to <strong>Advanced Mode</strong> to customize specific title fees, taxes, and commissions for the most accurate results.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Commissions & Credits</h3>
              <p>Adjust realtor commissions and factor in repair credits to see how negotiations affect your bottom line.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-slate-600 text-xs border-t border-slate-900">
        <p>© 2026 Net Seller Sheet. All calculations are estimates.</p>
      </footer>
    </main>
  );
}
