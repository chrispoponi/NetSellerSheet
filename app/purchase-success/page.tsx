"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Calculator, Check, Download, Mail } from "lucide-react";
import { generateExcelTool } from "@/lib/excel-generator";
import { DEFAULT_INPUTS, calculateNetProceeds } from "@/lib/calculator";

function PurchaseSuccessContent() {
    const searchParams = useSearchParams();
    const tier = searchParams.get('tier');

    const handleDownloadExcel = () => {
        // Generate a template Excel with default inputs
        const defaultResults = calculateNetProceeds(DEFAULT_INPUTS);
        generateExcelTool(DEFAULT_INPUTS, defaultResults);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative max-w-lg w-full text-center">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
                        <Calculator size={22} />
                    </div>
                    <span className="text-white font-bold text-xl">NetSellerSheet</span>
                </div>

                {/* Success Card */}
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl">
                    {/* Success Animation */}
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Check size={32} className="text-white" strokeWidth={3} />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-3">
                        Purchase Successful! 🎉
                    </h1>
                    <p className="text-slate-400 text-lg mb-8">
                        Your Seller's Toolkit is ready to download.
                    </p>

                    {/* Download Button */}
                    {tier === 'pro' && (
                        <button
                            onClick={handleDownloadExcel}
                            className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 mb-4"
                        >
                            <Download size={20} /> Download Excel Calculator
                        </button>
                    )}

                    {/* Additional Info */}
                    <div className="bg-slate-800/50 rounded-xl p-4 text-left space-y-3 mb-6">
                        <div className="flex items-start gap-3">
                            <Mail size={18} className="text-emerald-400 mt-0.5" />
                            <div>
                                <p className="text-white font-medium text-sm">Check Your Email</p>
                                <p className="text-slate-400 text-xs">
                                    We've sent a receipt and download link to your email for safekeeping.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA to Calculator */}
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                        Try the Online Calculator →
                    </a>
                </div>

                {/* Support */}
                <p className="text-slate-500 text-sm mt-6">
                    Questions? Email{" "}
                    <a href="mailto:support@netsellersheet.com" className="text-emerald-400 hover:text-emerald-300">
                        support@netsellersheet.com
                    </a>
                </p>
            </div>
        </div>
    );
}

export default function PurchaseSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white animate-pulse">Loading...</div>
            </div>
        }>
            <PurchaseSuccessContent />
        </Suspense>
    );
}
