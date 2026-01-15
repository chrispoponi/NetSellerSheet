# Refine My Net Sheet - Feature Specification

## 1. Core Concept
**Goal**: Upgrade users from Basic (Free) to Advanced (Paid $4.99).
**Philosophy**: "Improve clarity," not "Buy a product." 
**Placement**: Sticky button below Basic Results.

---

## 2. UX Flow

### A. The Trigger (Button)
*   **Label**: `Refine My Net Sheet`
*   **Subtext**: "Customize the details to see a more accurate take-home estimate."
*   **Visibility**: Only appears after Basic Results are calculated.
*   **Style**: Primary Brand Color (Emerald), Wide/Sticky on mobile.

### B. Step 1: Interstitial (The Hook)
*   **Headline**: "Refine Your Net Sheet"
*   **Body**: "You’re close. Add a few details to see a more accurate picture..."
*   **Value Props**:
    *   Customize commissions & fees (e.g. 5% vs 6%)
    *   Add repair credits & concessions
    *   Compare Best-Case vs. Conservative
    *   Download official PDF
*   **Price Point**: One-time $4.99 (No subscription).
*   **CTA**: `Continue & Refine`

### C. Step 2: Payment (Stripe)
*   **Product**: "Advanced Net Sheet Unlock" ($4.99)
*   **Email**: Pre-filled from Step 1.
*   **Success**: 
    1.  Update `seller_sheets` table (`is_paid = true`).
    2.  Redirect to Advanced Dashboard.

### D. Step 3: Advanced Dashboard
a.k.a. "The Editor".
*   **State**: Pre-filled with Basic inputs.
*   **Sections**:
    1.  **Sale Price**: Scenarios slider (+/- 5%).
    2.  **Commissions**: Split Slider (Buyer % / Seller %).
    3.  **Closing Costs**: Granular fields (Title, Escrow, Transfer Tax).
    4.  **Credits**: Repairs, Staging, Home Warranty.
    5.  **Loans**: Exact Payoff Date calculator.
*   **Outputs**:
    *   Side-by-side: Conservative | Expected | Best Case
    *   "Net Proceeds" highlighted in Green.

---

## 3. Technical Requirements

### Database Updates (`seller_sheets`)
*   Add columns:
    *   `commission_rate_total`: numeric
    *   `commission_split_buyer`: numeric
    *   `closing_fee_total`: numeric
    *   `repair_credit`: numeric
    *   `transfer_tax_custom`: numeric
    *   `transaction_id`: text (Stripe)

### API Routes
*   `POST /api/create-checkout-session`: Initializes Stripe.
*   `GET /api/payment/success`: Handles return, updates DB, redirects.
*   `POST /api/update-sheet`: Saves Advanced inputs.

### Analytics
*   Event: `view_refine_interstitial`
*   Event: `click_refine_continue`
*   Event: `purchase_success`
