"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calculator, Check, DollarSign, Download, GripVertical, Lock, Mail, Users, MapPin, X, User } from "lucide-react";
import { PremiumInput } from "../ui/PremiumInput";
import { PremiumButton } from "../ui/PremiumButton";
import { cn, formatCurrency, parseCurrency } from "@/lib/utils";
import { calculateNetProceeds, DEFAULT_INPUTS, type CalculatorInputs, type CalculatorResults } from "@/lib/calculator";
import { generateNetSheetPDF } from "@/lib/pdf-generator";
import { generateExcelTool } from "@/lib/excel-generator";

import { useRef } from "react";

export function MainCalculator() {
    return (
        <Suspense fallback={<div className="text-white text-center py-20">Loading your calculator...</div>}>
            <CalculatorContent />
        </Suspense>
    );
}

function CalculatorContent() {
    const searchParams = useSearchParams();
    const urlSheetId = searchParams.get('id');
    const howItWorksRef = useRef<HTMLDivElement>(null);

    const [step, setStep] = useState<'landing' | 'results'>('landing');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [mode, setMode] = useState<'basic' | 'advanced'>('basic');
    const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
    const [results, setResults] = useState<CalculatorResults | null>(null);
    const [sheetId, setSheetId] = useState<string | null>(null); // Track ID for updates

    const [showRefineModal, setShowRefineModal] = useState(false);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false); // New Recovery Modal
    const [isPaid, setIsPaid] = useState(false); // Tracks standard unlock ($4.99)
    const [isPro, setIsPro] = useState(false); // Tracks Pro Bundle ($9.99)

    // Derived State
    const isAdvancedMode = isPaid || isPro;

    // Email Capture State
    const [email, setEmail] = useState("");
    const [recoveryEmail, setRecoveryEmail] = useState(""); // For recovering lost sheets
    const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);

    // Scroll Handler
    const scrollToHowItWorks = () => {
        document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Real-time calculation when in Results mode
    useEffect(() => {
        if (step === 'results') {
            const res = calculateNetProceeds(inputs);
            setResults(res);
        }
    }, [inputs, step]);

    // CHECK FOR MAGIC LINK REHYDRATION
    useEffect(() => {
        const loadSheet = async () => {
            if (!urlSheetId) return;

            console.log("Found Sheet ID, recovering session:", urlSheetId);

            try {
                const response = await fetch(`/api/get-sheet?id=${urlSheetId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.inputs) {
                        setInputs(data.inputs);
                        setIsPaid(data.is_paid || false);

                        // Handle Pro Mode vs Advanced
                        if (data.mode === 'pro_bundle') {
                            setIsPro(true);
                        }

                        // If paid, auto set to Advanced
                        if (data.is_paid) setMode('advanced');

                        // Set Step to Results
                        setStep('results');
                        setEmail(data.email || "");

                        // Also set the sheetId state so they can continue to update it
                        setSheetId(urlSheetId);

                        // Calculate fresh results
                        const freshResults = calculateNetProceeds(data.inputs);
                        setResults(freshResults);
                    }
                }
            } catch (e) {
                console.error("Failed to load sheet", e);
            }
        };

        loadSheet();
    }, [urlSheetId]);


    const handleCheckout = async (tier: 'basic' | 'pro') => {
        if (!sheetId) {
            alert("Error: No sheet ID found. Please try refreshing.");
            return;
        }

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sheetId, tier })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Checkout initialization failed.");
            }
        } catch (e) {
            console.error(e);
            alert("Payment system error.");
        }
    };

    const handleInitialCalculate = () => {
        // Validate inputs (simple)
        if (!inputs.salePrice || !inputs.zipCode) {
            alert("Please enter a sale price and zip code."); // Replace with better UI validation
            return;
        }
        // Trigger "Soft Gate"
        setShowEmailModal(true);
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsEmailSubmitting(true);

        try {
            // Perform calculation immediately to have results ready to send
            const currentResults = calculateNetProceeds(inputs);

            // In a real scenario you would have the base URL from env
            const response = await fetch('/api/submit-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    zipCode: inputs.zipCode,
                    mode,
                    inputs,
                    results: currentResults
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.sheetId) setSheetId(data.sheetId);
            }

            if (!response.ok) {
                // If API fails, we still want to show results in UI for better UX, but log error
                console.error('Failed to submit lead');
            }

            setResults(currentResults);
            setStep('results');
            setShowEmailModal(false);
        } catch (error) {
            console.error("Submission error:", error);
            // Fallback: Show results anyway
            const currentResults = calculateNetProceeds(inputs);
            setResults(currentResults);
            setStep('results');
            setShowEmailModal(false);
        } finally {
            setIsEmailSubmitting(false);
        }
    };

    const updateInput = (field: keyof CalculatorInputs, value: string | number) => {
        setInputs(prev => ({
            ...prev,
            [field]: typeof value === 'string' ? (field === 'zipCode' ? value : parseCurrency(value)) : value
        }));
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 pb-20">
            {/* Navbar */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-md"
            >
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight clickable" onClick={() => window.location.href = '/'}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
                            <Calculator size={18} />
                        </div>
                        NetSellerSheet
                    </div>

                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
                            <button onClick={scrollToHowItWorks} className="hover:text-white transition-colors">How it Works</button>
                            <button onClick={() => setShowRefineModal(true)} className="hover:text-white transition-colors">Pricing</button>
                        </nav>
                        <button
                            onClick={() => setShowRecoveryModal(true)}
                            className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
                            title="Recover My Sheet"
                        >
                            <User size={20} />
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Header / Hero Section */}
            <div className="text-center px-4 mb-4 mt-8">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                    Net Seller Sheet
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    <span className="text-emerald-400 font-medium">Free Home Seller Tool.</span> Calculate exactly what you walk away with.
                </p>
            </div>

            <AnimatePresence mode="wait">
                {step === 'landing' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center text-center space-y-8"
                    >
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                                What's your home <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">actually</span> worth?
                            </h1>
                            <p className="text-xl text-slate-400 max-w-xl mx-auto">
                                Don't guess. See your real net proceeds after fees, commissions, and closing costs.
                            </p>
                        </div>

                        <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-6">
                            <PremiumInput
                                label="Estimated Sale Price"
                                placeholder="450,000"
                                prefix={<DollarSign size={16} />}
                                value={inputs.salePrice > 0 ? inputs.salePrice.toLocaleString() : ''}
                                onChange={(e) => updateInput('salePrice', e.target.value)}
                                type="text"
                            />

                            <PremiumInput
                                label="Remaining Mortgage (Optional)"
                                placeholder="250,000"
                                prefix={<DollarSign size={16} />}
                                value={inputs.mortgageBalance > 0 ? inputs.mortgageBalance.toLocaleString() : ''}
                                onChange={(e) => updateInput('mortgageBalance', e.target.value)}
                                type="text"
                            />

                            <PremiumInput
                                label="Property Zip Code"
                                placeholder="62225" // Scott AFB Area
                                value={inputs.zipCode}
                                onChange={(e) => updateInput('zipCode', e.target.value)}
                                maxLength={5}
                            />

                            <PremiumButton
                                size="lg"
                                className="w-full text-lg shadow-emerald-900/50"
                                onClick={handleInitialCalculate}
                            >
                                Calculate Net Proceeds <ArrowRight className="ml-2 w-5 h-5" />
                            </PremiumButton>

                            <p className="text-xs text-center text-slate-500">
                                Trusted by 500+ Local Families • No Spam Promise
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* RESULTS VIEW */}
                {step === 'results' && results && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full space-y-8"
                    >
                        {/* Header / Mode Switcher */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <button
                                onClick={() => setStep('landing')}
                                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                            >
                                ← Edit Inputs
                            </button>
                            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => setMode('basic')}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                        mode === 'basic' ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                                    )}
                                >
                                    Basic Estimate
                                </button>
                                <button
                                    onClick={() => {
                                        if (isAdvancedMode) setMode('advanced');
                                        else setShowRefineModal(true);
                                    }}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                        mode === 'advanced' ? "bg-emerald-900/30 text-emerald-400 border border-emerald-900/50" : "text-slate-400 hover:text-slate-200"
                                    )}
                                >
                                    {!isAdvancedMode && <Lock size={12} />} Advanced Mode
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            {/* LEFT: Breakdown (Narrower - 2 cols) */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Primary Card - Jazzed Up */}
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 shadow-2xl shadow-emerald-500/10 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 mix-blend-overlay">
                                        <DollarSign size={180} className="text-emerald-500" />
                                    </div>
                                    <div className="absolute -left-20 -top-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

                                    <h3 className="text-slate-400 font-medium mb-2 text-sm uppercase tracking-wider">Estimated Net Proceeds</h3>
                                    <div className="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight mb-4 filter drop-shadow-lg">
                                        {formatCurrency(results.netProceeds)}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                        <Check size={12} strokeWidth={3} /> Based on {formatCurrency(inputs.salePrice)} sale
                                    </div>
                                </motion.div>

                                {/* Detailed Breakdown Table (Compact) */}
                                <div className="bg-slate-950/40 rounded-2xl p-6 border border-white/5 space-y-4 backdrop-blur-sm">
                                    <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                                        Closing Cost Breakdown
                                        <div className="h-px bg-slate-800 flex-1 ml-2"></div>
                                    </h4>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center text-slate-300">
                                            <span>Realtor Commissions (Est. {inputs.commissionRate}%)</span>
                                            <span className="text-red-400 font-medium font-mono">-{formatCurrency(results.breakdown.commission)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-400">
                                            <span>Closing Costs (~{inputs.closingCostsRate}%)</span>
                                            <span className="text-red-400/80 font-mono">-{formatCurrency(results.breakdown.closingCosts)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-400">
                                            <span>Title & Escrow Fees</span>
                                            <span className="text-red-400/80 font-mono">-{formatCurrency(results.breakdown.titleEscrow)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-400">
                                            <span>Prorated Taxes</span>
                                            <span className="text-red-400/80 font-mono">-{formatCurrency(results.breakdown.taxes)}</span>
                                        </div>

                                        {(results.breakdown.repairs > 0 || results.breakdown.credits > 0) && (
                                            <div className="flex justify-between items-center text-slate-400">
                                                <span>Repairs & Credits</span>
                                                <span className="text-red-400/80 font-mono">-{formatCurrency(results.breakdown.repairs + results.breakdown.credits)}</span>
                                            </div>
                                        )}

                                        <div className="h-px bg-slate-800 my-2" />

                                        <div className="flex justify-between items-center text-slate-300">
                                            <span>Mortgage Payoff</span>
                                            <span className="text-red-400/80 font-mono">-{formatCurrency(results.breakdown.mortgagePayoff)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Refine CTA (Mobile visible, Desktop hidden if viewing Fine Tune) */}
                                {!isAdvancedMode && (
                                    <div className="hidden"></div>
                                )}
                            </div>

                            {/* RIGHT: Controls (Wider - 3 cols) */}
                            <div className="lg:col-span-3 space-y-6">
                                {mode === 'advanced' ? (
                                    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
                                        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/5 relative">
                                            {/* Subtle top glow */}
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20"></div>

                                            <div className="p-8 space-y-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                                        <GripVertical size={20} />
                                                    </div>
                                                    <h3 className="font-bold text-white text-xl tracking-tight">
                                                        Fine Tune Calculation
                                                    </h3>
                                                </div>

                                                <div className="space-y-5">
                                                    {/* Commission Slider */}
                                                    <div>
                                                        <div className="flex justify-between text-sm mb-3">
                                                            <span className="text-slate-300 font-medium text-xs uppercase tracking-wide">Realtor Commission</span>
                                                            <span className="text-emerald-400 font-bold">{inputs.commissionRate}% <span className="text-slate-500 font-normal">→ {formatCurrency(results?.breakdown.commission || 0)}</span></span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0" max="8" step="0.5"
                                                            value={inputs.commissionRate}
                                                            onChange={(e) => updateInput('commissionRate', parseFloat(e.target.value))}
                                                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-colors"
                                                        />
                                                        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                                                            <span>0%</span>
                                                            <span>4%</span>
                                                            <span>8%</span>
                                                        </div>
                                                    </div>

                                                    {/* Repairs Row - Wider Inputs */}
                                                    <div className="bg-slate-800/40 rounded-lg p-3 flex items-center justify-between border border-slate-700/50">
                                                        <span className="text-slate-300 text-sm font-medium">Repair Credits</span>
                                                        <div className="w-40">
                                                            <PremiumInput
                                                                label=""
                                                                prefix="$"
                                                                value={inputs.repairCosts}
                                                                onChange={(e) => updateInput('repairCosts', e.target.value)}
                                                                className="h-10 text-right bg-slate-900 border-slate-700 font-mono"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Closing Costs Container */}
                                                    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-inner">
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Closing Cost Details</h4>

                                                        {/* Row: Title */}
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-slate-300 text-sm">Title & Escrow</span>
                                                                <span className="text-[10px] text-emerald-500/80 flex items-center gap-1"><MapPin size={10} /> {inputs.zipCode || 'National'} Avg</span>
                                                            </div>
                                                            <div className="flex-1 max-w-[180px]">
                                                                <PremiumInput
                                                                    prefix="$"
                                                                    value={inputs.titleFees}
                                                                    onChange={(e) => updateInput('titleFees', e.target.value)}
                                                                    className="h-9 text-right bg-slate-900/80 text-sm font-mono"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Row: Taxes */}
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-slate-300 text-sm">Prorated Taxes</span>
                                                                <span className="text-[10px] text-slate-500">Calculated Estimate</span>
                                                            </div>
                                                            <div className="flex-1 max-w-[180px]">
                                                                <PremiumInput
                                                                    prefix="$"
                                                                    value={inputs.proratedTaxes}
                                                                    onChange={(e) => updateInput('proratedTaxes', e.target.value)}
                                                                    className="h-9 text-right bg-slate-900/80 text-sm font-mono"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Row: Transfer Tax */}
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="text-slate-300 text-sm">Transfer Tax</span>
                                                            <div className="flex-1 max-w-[180px]">
                                                                <PremiumInput
                                                                    prefix="$"
                                                                    value={inputs.transferTax}
                                                                    onChange={(e) => updateInput('transferTax', e.target.value)}
                                                                    className="h-9 text-right bg-slate-900/80 text-sm font-mono"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Row: Misc / Warranty */}
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="text-slate-300 text-sm">Home Warranty / Misc</span>
                                                            <div className="flex-1 max-w-[180px]">
                                                                <PremiumInput
                                                                    prefix="$"
                                                                    value={inputs.miscFees}
                                                                    onChange={(e) => updateInput('miscFees', e.target.value)}
                                                                    className="h-9 text-right bg-slate-900/80 text-sm font-mono"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Single Line Scenarios */}
                                                    <div className="grid grid-cols-3 gap-0 bg-slate-950/50 rounded-lg overflow-hidden border border-slate-800/50 divide-x divide-slate-800">
                                                        <div className="p-3 text-center hover:bg-emerald-950/20 transition-colors">
                                                            <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Best Case</div>
                                                            <div className="text-sm font-bold text-white">${((results?.netProceeds || 0) * 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                                        </div>
                                                        <div className="p-3 text-center bg-slate-800/50">
                                                            <div className="text-[10px] text-blue-400 font-bold uppercase mb-1">Expected</div>
                                                            <div className="text-sm font-bold text-white">${(results?.netProceeds || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                                        </div>
                                                        <div className="p-3 text-center hover:bg-red-950/10 transition-colors">
                                                            <div className="text-[10px] text-red-400 font-bold uppercase mb-1">Conservative</div>
                                                            <div className="text-sm font-bold text-slate-300">${((results?.netProceeds || 0) * 0.95).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <PremiumButton className="w-full" variant="secondary" onClick={() => results && generateNetSheetPDF(inputs, results, email || "My Estimate")}>
                                                    <Download className="w-4 h-4 mr-2" /> Download PDF
                                                </PremiumButton>

                                                {isPro && (
                                                    <PremiumButton className="w-full bg-green-700 hover:bg-green-600 border-green-600 text-white" variant="outline" onClick={() => results && generateExcelTool(inputs, results)}>
                                                        <Download className="w-4 h-4 mr-2" /> Download Excel Tool
                                                    </PremiumButton>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="hidden lg:block p-6 bg-slate-900/20 border border-slate-800/50 rounded-2xl text-center space-y-4">
                                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                            <Lock size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-slate-300 font-medium">Advanced Inputs Locked</h4>
                                            <p className="text-xs text-slate-500 mt-2">
                                                Upgrade to adjust commissions, add repair credits, and model specific negotiation scenarios.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* EMAIL CAPTURE MODAL */}
            <AnimatePresence>
                {showEmailModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setShowEmailModal(false)}
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="text-center space-y-4 mb-8">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400 mb-4">
                                    <Mail size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Your Estimate is Ready</h2>
                                <p className="text-slate-400">
                                    We've crunched the numbers for <span className="text-white font-medium">{inputs.zipCode}</span>. Enter your email to unlock your Net Sheet and get a copy for your records.
                                </p>
                            </div>

                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <PremiumInput
                                    placeholder="you@email.com"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-950"
                                />
                                <PremiumButton
                                    className="w-full"
                                    size="lg"
                                    isLoading={isEmailSubmitting}
                                >
                                    Reveal My Net Proceeds
                                </PremiumButton>

                                {/* Recovery Instructions */}
                                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs text-slate-400 text-center leading-relaxed">
                                    <span className="text-emerald-400 font-medium block mb-1">How can I come back?</span>
                                    We will email you a secure link to return to this calculation anytime. No password required.
                                </div>

                                <p className="text-xs text-center text-slate-600 mt-4">
                                    We respect your privacy. No spam, ever.
                                </p>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* REFINE INTERSTITIAL MODAL */}
            <AnimatePresence>
                {showRefineModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                            onClick={() => setShowRefineModal(false)}
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-3xl p-8 shadow-2xl overflow-hidden"
                        >
                            {/* Decorative Blur */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/20 blur-[80px] -z-10" />

                            <div className="text-center space-y-2 mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-white">Refine Your Net Sheet</h2>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    You’re close. Add a few details to see a more accurate picture of what you may take home.
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <FeatureBullet icon={<DollarSign size={18} />} text="Customize commissions & transaction fees" />
                                <FeatureBullet icon={<GripVertical size={18} />} text="Add repair credits & concessions" />
                                <FeatureBullet icon={<Calculator size={18} />} text="Compare Best-Case vs. Conservative scenarios" />
                                <FeatureBullet icon={<Download size={18} />} text="Download official PDF net sheet" />
                            </div>

                            <div className="space-y-4">
                                <PremiumButton
                                    className="w-full text-lg h-14"
                                    size="lg"
                                    onClick={() => handleCheckout('basic')}
                                >
                                    Unlock Advanced Mode <span className="ml-2 text-emerald-200">($4.99)</span>
                                </PremiumButton>

                                {/* PRO UPSELL */}
                                <div className="mt-6 pt-6 border-t border-slate-700/50">
                                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                            BEST VALUE
                                        </div>

                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="p-3 bg-green-900/30 rounded-lg text-green-400">
                                                <DollarSign size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg">Don't have your numbers yet?</h3>
                                                <p className="text-slate-400 text-sm mt-1">
                                                    Download the <strong>Master Excel Calculator</strong> to refine offline at your own pace. Includes moving checklist.
                                                </p>
                                            </div>
                                        </div>

                                        <PremiumButton
                                            className="w-full bg-slate-100 hover:bg-white text-slate-900 border-none"
                                            onClick={() => handleCheckout('pro')}
                                        >
                                            Get Seller's Toolkit <span className="ml-2 font-bold">($9.99)</span>
                                        </PremiumButton>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                                    <span>One-time payment</span>
                                    <span>•</span>
                                    <span>Secure checkout</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* === RECOVERY MODAL === */}
            <AnimatePresence>
                {showRecoveryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setShowRecoveryModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl overflow-hidden"
                        >
                            <div className="text-center space-y-2 mb-6">
                                <h3 className="text-xl font-bold text-white">Recover Your Sheet</h3>
                                <p className="text-slate-400 text-sm">
                                    Lost your link? Enter your email and we'll send it back to you.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <PremiumInput
                                    placeholder="your@email.com"
                                    value={recoveryEmail}
                                    onChange={(e) => setRecoveryEmail(e.target.value)}
                                />
                                <PremiumButton
                                    className="w-full"
                                    onClick={() => {
                                        if (!recoveryEmail.includes('@')) {
                                            alert("Please enter a valid email.");
                                            return;
                                        }
                                        alert(`Magic Link sent to ${recoveryEmail}! Check your inbox.`); // Placeholder
                                        setShowRecoveryModal(false);
                                    }}
                                >
                                    Send Magic Link
                                </PremiumButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FeatureBullet({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="text-emerald-400">{icon}</div>
            <span className="text-slate-200 font-medium text-sm">{text}</span>
        </div>
    )
}

function ResultRow({ label, value, isNegative }: { label: string, value: number, isNegative?: boolean }) {
    if (value === 0) return null;
    return (
        <div className="flex justify-between items-center text-slate-300">
            <span>{label}</span>
            <span className={cn("font-medium", isNegative ? "text-red-400" : "text-white")}>
                {isNegative && "-"}{formatCurrency(value)}
            </span>
        </div>
    )
}
