"use client";

import { useEffect, useState } from "react";
import { Calculator, Download, ArrowRight, Check } from "lucide-react";

export default function BuyToolkitPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/checkout-direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: 'pro' })
            });

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                setError("Failed to initialize checkout. Please try again.");
                setIsLoading(false);
            }
        } catch (e) {
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative max-w-lg w-full">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
                        <Calculator size={22} />
                    </div>
                    <span className="text-white font-bold text-xl">NetSellerSheet</span>
                </div>

                {/* Product Card */}
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold mb-4">
                            <Download size={12} /> INSTANT DOWNLOAD
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-3">
                            Seller's Toolkit Bundle
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Everything you need to calculate your net proceeds like a pro.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                        <Feature text="Master Excel Calculator with formulas" />
                        <Feature text="Model multiple sale price scenarios" />
                        <Feature text="Customize all fees & commissions" />
                        <Feature text="Home Seller's Moving Checklist" />
                        <Feature text="Works offline - yours forever" />
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-5xl font-black text-white">$9.99</span>
                            <span className="text-slate-500 text-lg">one-time</span>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">No subscriptions. No hidden fees.</p>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Loading Checkout...</span>
                        ) : (
                            <>
                                Get Instant Access <ArrowRight size={20} />
                            </>
                        )}
                    </button>

                    {error && (
                        <p className="text-red-400 text-sm text-center mt-4">{error}</p>
                    )}

                    {/* Trust Signals */}
                    <div className="flex items-center justify-center gap-4 mt-6 text-xs text-slate-500">
                        <span>🔒 Secure Checkout</span>
                        <span>•</span>
                        <span>💳 Powered by Stripe</span>
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <a href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
                        ← Back to Calculator
                    </a>
                </div>
            </div>
        </div>
    );
}

function Feature({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-slate-300">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Check size={12} className="text-emerald-400" />
            </div>
            <span>{text}</span>
        </div>
    );
}
