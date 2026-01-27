"use client";

import React, { useState, useEffect, useMemo } from "react";

// Helper to format numbers with commas
const formatNumber = (num: number): string => {
    return num.toLocaleString("en-US");
};

// Helper to parse formatted string back to number
const parseFormattedNumber = (str: string): number => {
    const cleaned = str.replace(/[^0-9.-]/g, "");
    return Number(cleaned) || 0;
};

export const MortgageComparisonTool = () => {
    const [netProceeds, setNetProceeds] = useState<number>(150000);
    const [newHomePrice, setNewHomePrice] = useState<number>(450000);
    const [interestRate, setInterestRate] = useState<number>(6.5);
    const [loanTerm, setLoanTerm] = useState<number>(30);

    // Input display values (formatted strings)
    const [proceedsDisplay, setProceedsDisplay] = useState("150,000");
    const [homePriceDisplay, setHomePriceDisplay] = useState("450,000");

    // Calculations
    const results = useMemo(() => {
        // Down payment = net proceeds
        const downPayment = netProceeds;
        const loanAmount = Math.max(0, newHomePrice - downPayment);
        const downPaymentPercent = newHomePrice > 0 ? (downPayment / newHomePrice) * 100 : 0;

        // Monthly Payment Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;

        let monthlyPayment = 0;
        if (loanAmount > 0 && numberOfPayments > 0) {
            if (interestRate === 0) {
                monthlyPayment = loanAmount / numberOfPayments;
            } else {
                monthlyPayment =
                    (loanAmount *
                        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
                    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
            }
        }

        // Total Interest Paid over life of loan
        const totalPaid = monthlyPayment * numberOfPayments;
        const totalInterest = Math.max(0, totalPaid - loanAmount);

        // --- COMPARISON: Standard 20% Down Scenario ---
        const standardDownPercent = 0.2;
        const standardDown = newHomePrice * standardDownPercent;
        const standardLoanAmount = Math.max(0, newHomePrice - standardDown);

        let standardMonthlyPayment = 0;
        if (standardLoanAmount > 0 && numberOfPayments > 0) {
            if (interestRate === 0) {
                standardMonthlyPayment = standardLoanAmount / numberOfPayments;
            } else {
                standardMonthlyPayment =
                    (standardLoanAmount *
                        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
                    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
            }
        }

        const monthlySavings = standardMonthlyPayment - monthlyPayment;
        const lifetimeSavings = monthlySavings * numberOfPayments;

        // PMI check (required if down payment < 20%)
        const requiresPMI = downPaymentPercent < 20;

        return {
            loanAmount: Math.round(loanAmount),
            monthlyPayment: Math.round(monthlyPayment),
            totalInterest: Math.round(totalInterest),
            downPaymentPercent: Math.round(downPaymentPercent * 10) / 10,
            standardMonthlyPayment: Math.round(standardMonthlyPayment),
            monthlySavings: Math.round(monthlySavings),
            lifetimeSavings: Math.round(lifetimeSavings),
            requiresPMI,
        };
    }, [netProceeds, newHomePrice, interestRate, loanTerm]);

    // Input handlers with formatting
    const handleProceedsChange = (value: string) => {
        setProceedsDisplay(value);
        setNetProceeds(parseFormattedNumber(value));
    };

    const handleProceedsBlur = () => {
        setProceedsDisplay(formatNumber(netProceeds));
    };

    const handleHomePriceChange = (value: string) => {
        setHomePriceDisplay(value);
        setNewHomePrice(parseFormattedNumber(value));
    };

    const handleHomePriceBlur = () => {
        setHomePriceDisplay(formatNumber(newHomePrice));
    };

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-emerald-400"
                        >
                            <path d="M3 21h18" />
                            <path d="M5 21V7l8-4 8 4v14" />
                            <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white">
                            Next Home Calculator
                        </h3>
                        <p className="text-slate-400 text-sm">
                            See how your{" "}
                            <span className="text-emerald-400 font-semibold">
                                Net Proceeds
                            </span>{" "}
                            power your next purchase.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* INPUTS */}
                <div className="space-y-6">
                    {/* Net Proceeds Input */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Your Net Proceeds (Down Payment)
                            </label>
                            <span className="text-emerald-400 text-sm font-bold">
                                {results.downPaymentPercent}% Down
                            </span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                $
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={proceedsDisplay}
                                onChange={(e) => handleProceedsChange(e.target.value)}
                                onBlur={handleProceedsBlur}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-8 pr-4 text-xl text-white font-semibold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                            />
                        </div>
                        {/* Slider */}
                        <input
                            type="range"
                            min={0}
                            max={Math.max(newHomePrice, 500000)}
                            step={5000}
                            value={netProceeds}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setNetProceeds(val);
                                setProceedsDisplay(formatNumber(val));
                            }}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    {/* Home Price Input */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Target New Home Price
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                $
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={homePriceDisplay}
                                onChange={(e) => handleHomePriceChange(e.target.value)}
                                onBlur={handleHomePriceBlur}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-8 pr-4 text-xl text-white font-semibold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                            />
                        </div>
                        {/* Slider */}
                        <input
                            type="range"
                            min={100000}
                            max={2000000}
                            step={10000}
                            value={newHomePrice}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setNewHomePrice(val);
                                setHomePriceDisplay(formatNumber(val));
                            }}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    {/* Rate & Term Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Interest Rate
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.125"
                                    min="0"
                                    max="15"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 pr-10 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    %
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Loan Term
                            </label>
                            <select
                                value={loanTerm}
                                onChange={(e) => setLoanTerm(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
                            >
                                <option value={30}>30 Years</option>
                                <option value={20}>20 Years</option>
                                <option value={15}>15 Years</option>
                                <option value={10}>10 Years</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* RESULTS */}
                <div className="flex flex-col gap-4">
                    {/* Primary Result: Monthly Payment */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900/30 via-slate-900 to-slate-900 border border-emerald-500/20 relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                        <p className="text-emerald-400 text-xs uppercase mb-2 font-bold tracking-wide">
                            Your Monthly Payment
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-white tracking-tight">
                                ${formatNumber(results.monthlyPayment)}
                            </span>
                            <span className="text-lg text-slate-400">/mo</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Principal & Interest • {loanTerm}-Year Fixed
                        </p>
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                            <p className="text-slate-500 text-xs uppercase mb-1">
                                Loan Amount
                            </p>
                            <p className="text-xl font-bold text-white">
                                ${formatNumber(results.loanAmount)}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                            <p className="text-slate-500 text-xs uppercase mb-1">
                                Total Interest
                            </p>
                            <p className="text-xl font-bold text-white">
                                ${formatNumber(results.totalInterest)}
                            </p>
                        </div>
                    </div>

                    {/* Comparison Card */}
                    {results.monthlySavings > 0 && (
                        <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-cyan-500/10 shrink-0">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-cyan-400"
                                    >
                                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                        <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-cyan-400 text-xs uppercase font-bold mb-1">
                                        Savings vs. 20% Down
                                    </p>
                                    <p className="text-white font-semibold">
                                        <span className="text-lg">
                                            ${formatNumber(results.monthlySavings)}
                                        </span>
                                        <span className="text-slate-400 text-sm">/month</span>
                                    </p>
                                    <p className="text-slate-400 text-xs mt-1">
                                        ${formatNumber(results.lifetimeSavings)} over {loanTerm}{" "}
                                        years
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PMI Warning */}
                    {results.requiresPMI && (
                        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20">
                            <div className="flex items-center gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-amber-400 shrink-0"
                                >
                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                                    <path d="M12 9v4" />
                                    <path d="M12 17h.01" />
                                </svg>
                                <p className="text-amber-400 text-sm">
                                    <span className="font-bold">PMI Required:</span>{" "}
                                    <span className="text-amber-300/80">
                                        Down payment is below 20%. Expect ~$100-300/mo in Private
                                        Mortgage Insurance.
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-slate-600 text-xs text-center">
                    * Estimates are for illustrative purposes only and do not include
                    property taxes, homeowners insurance, HOA fees, or PMI. Actual
                    payments may vary.
                </p>
            </div>
        </div>
    );
};
