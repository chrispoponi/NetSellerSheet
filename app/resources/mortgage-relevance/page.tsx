
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MortgageComparisonTool } from "@/components/features/MortgageComparisonTool";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Seller Net Sheets Impact Mortgage Affordability | Real Estate Proceeds Calculator for Sellers',
    description: 'Understand how your home sale proceeds can drastically lower your next mortgage payment. Use our free calculator to see your buying power.',
    keywords: ['Seller Net Sheet', 'Mortgage Calculator', 'Real Estate Proceeds', 'Home Selling Guide', 'Buying Power'],
};

export default function MortgageRelevancePage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200">

            {/* Article Header */}
            <div className="relative overflow-hidden py-24 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] -z-10" />
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                        Seller Education
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                        The Hidden Link Between Your <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Net Sheet & Next Mortgage
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        Most sellers focus on the sale price. Smart sellers focus on the <strong>Net Proceeds</strong>.
                        Here is why your "Walk Away" number matters more than your Zestimate.
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <article className="max-w-4xl mx-auto px-6 pb-24">

                {/* Intro */}
                <div className="prose prose-invert prose-lg max-w-none mb-16">
                    <p>
                        When you sell your home, the check you receive at closing—your <strong>Seller Net Proceeds</strong>—is the fuel for your next move.
                        Yet, many homeowners confuse their <em>Listing Price</em> with their actual <em>Buying Power</em>.
                    </p>
                    <p>
                        After commissions, closing costs, and payoff of your existing lien, what remains is your true equity.
                        Applying this equity correctly can completely change the affordability of your next dream home.
                    </p>
                </div>

                {/* The Tool */}
                <div id="calculator" className="my-16 scroll-mt-24">
                    <MortgageComparisonTool />
                </div>

                {/* Deep Dive Content */}
                <div className="prose prose-invert prose-lg max-w-none space-y-12">

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Why "Net" Matters More Than "Gross"</h2>
                        <p>
                            Real estate agents often talk about the "Gross Sale Price" because it sounds impressive.
                            But your bank account only cares about the "Net." A $500,000 sale might result in $200,000
                            in your pocket—or only $50,000, depending on your current mortgage balance and closing costs.
                        </p>
                        <p>
                            Using a <Link href="/" className="text-emerald-400 hover:text-emerald-300 no-underline border-b border-emerald-500/30 hover:border-emerald-400">Net Seller Sheet</Link> gives you the hard truth before you list, allowing you to budget accurately for your next down payment.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Leveraging Proceeds to Lower Rates</h2>
                        <p>
                            In a high-interest rate environment, a larger down payment (funded by your sale proceeds)
                            does more than just lower the loan amount. It can often unlock:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-300">
                            <li><strong>Lower Interest Rates:</strong> Lenders often offer better rates to borrowers with lower Loan-to-Value (LTV) ratios.</li>
                            <li><strong>No PMI:</strong> Putting more than 20% down eliminates Private Mortgage Insurance, saving you hundreds per month.</li>
                            <li><strong>Buying Downs:</strong> You can use a portion of your net proceeds to "buy down" your interest rate permanently.</li>
                        </ul>
                    </section>

                </div>

                {/* CTA */}
                <div className="mt-20 p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Ready to see your real numbers?</h3>
                    <p className="text-slate-400 mb-8">
                        Get an instant, accurate estimate of your home sale proceeds right now.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-950 bg-emerald-400 rounded-full hover:bg-emerald-300 transition-colors"
                    >
                        Calculate My Net Proceeds
                    </Link>
                </div>

            </article>

        </main>
    );
}
