export type CalculationMode = 'basic' | 'advanced';

export interface CalculatorInputs {
    salePrice: number;
    mortgageBalance: number;
    zipCode: string;
    // Advanced Inputs
    commissionRate: number; // Percentage (e.g., 5.0)
    closingCostsRate: number; // Percentage (e.g., 1.5)
    titleFees: number;
    repairCosts: number;
    transferTax: number;
    proratedTaxes: number;
    miscFees: number;
    customCredits: number;
}

export interface CalculatorResults {
    grossEquity: number;
    totalSellingCosts: number;
    netProceeds: number;
    breakdown: {
        commission: number;
        closingCosts: number;
        titleEscrow: number;
        taxes: number;
        repairs: number;
        credits: number;
        mortgagePayoff: number;
    };
}

export const DEFAULT_INPUTS: CalculatorInputs = {
    salePrice: 0,
    mortgageBalance: 0,
    zipCode: '',
    commissionRate: 5.0,
    closingCostsRate: 1.5,
    titleFees: 1500, // National avg estimate
    repairCosts: 0,
    transferTax: 0, // Will be 0 for basic, calculated for advanced
    proratedTaxes: 500, // Estimate
    miscFees: 0,
    customCredits: 0,
};

// Basic Tax Proration Logic:
// In many US states, taxes are paid in arrears.
// We estimate annual tax as roughly 1.5% of value (national avg placeholder, customizable).
// We calculate how many months of the current year the seller has owned the home.
export function estimateProratedTaxes(salePrice: number, monthOfSale: number = new Date().getMonth() + 1): number {
    const estimatedAnnualTaxRate = 0.015; // 1.5%
    const annualTaxes = salePrice * estimatedAnnualTaxRate;
    const dailyTax = annualTaxes / 365;

    // Approximate days owned in current year (simple calc)
    const daysOwned = monthOfSale * 30;

    // Credit to buyer for time seller owned home
    return Math.round(dailyTax * daysOwned);
}

// Title Fee Estimation (Simple Tiered Logic)
// Scale based on price ranges common in different tiers.
export function estimateTitleFees(salePrice: number): number {
    // Base fee
    let fee = 1000;

    // Add variable portion (~$4 per $1000 over $100k)
    if (salePrice > 100000) {
        fee += ((salePrice - 100000) / 1000) * 4;
    }

    return Math.round(fee);
}


export function calculateNetProceeds(inputs: CalculatorInputs): CalculatorResults {
    const {
        salePrice,
        mortgageBalance,
        commissionRate,
        closingCostsRate,
        // titleFees, // Remove dependency on manual input for basic fallback
        repairCosts,
        miscFees,
        customCredits,
        // proratedTaxes, // Remove dependency on manual input for basic fallback
    } = inputs;

    // 1. Calculate Commission
    const commission = salePrice * (commissionRate / 100);

    // 2. Smart Estimates (if inputs are default/zero, we calculate)
    const calculatedTitleFees = inputs.titleFees > 0 ? inputs.titleFees : estimateTitleFees(salePrice);
    const calculatedProratedTaxes = inputs.proratedTaxes > 0 ? inputs.proratedTaxes : estimateProratedTaxes(salePrice);

    // 3. Calculate Closing Costs (Lender fees, misc)
    const closingCosts = salePrice * (closingCostsRate / 100);

    // 4. Total Title/Escrow + Taxes
    const titleEscrow = calculatedTitleFees; // Keep taxes separate in logic

    // 5. Repairs/Credits
    const repairsAndCredits = repairCosts + customCredits + miscFees;

    // 6. Total Selling Costs
    const totalSellingCosts = commission + closingCosts + titleEscrow + calculatedProratedTaxes + repairsAndCredits;

    // 7. Gross Equity (Sale Price - Mortgage)
    const grossEquity = salePrice - mortgageBalance;

    // 8. Net Proceeds
    const netProceeds = salePrice - mortgageBalance - totalSellingCosts;

    return {
        grossEquity,
        totalSellingCosts,
        netProceeds,
        breakdown: {
            commission,
            closingCosts,
            titleEscrow: titleEscrow,
            taxes: calculatedProratedTaxes,
            repairs: repairCosts,
            credits: customCredits + miscFees,
            mortgagePayoff: mortgageBalance
        }
    };
}
