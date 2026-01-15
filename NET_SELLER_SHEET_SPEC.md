# NetSellerSheet.com - Product Specification

## 1. Product Overview

**NetSellerSheet.com** is a specialized financial modeling tool for homeowners. It answers the critical question: *"If I sell my house, how much cash will I actually walk away with?"*

The product operates in two tiers:
*   **Basic Mode (Free)**: Quick, intelligent estimates based on national averages. Primary goal: Lead Capture.
*   **Advanced Mode ($4.99)**: Precise, line-item control for transaction planning. Primary goal: Value Delivery & Qualification.

---

## 2. Calculation Formulas

### A. Core Variables
| Variable | Symbol | Source (Basic) | Source (Advanced) |
| :--- | :--- | :--- | :--- |
| **Sale Price** | `P` | User Input | User Input |
| **Mortgage Payoff** | `M` | User Input (Optional) | User Input |
| **Realtor Commission** | `C_comm` | `P * 0.05` | `P * (User_Comm_Rate)` |
| **Closing Costs** | `C_close` | `P * 0.015` | User Input (or defaults) |
| **Title & Escrow** | `C_title` | Fixed Estimates (e.g. $2500) | User Input |
| **Prorated Taxes** | `C_tax` | Estimate based on location | User Input |
| **Misc/Repairs** | `C_misc` | `P * 0.005` (Buffer) | Sum of specific line items |

### B. Basic Mode Logic
*   **Estimated Commission**: `Commission = Sale Price * 5%`
*   **Estimated Closing Costs**: `Closing = Sale Price * 1.5% + $1,500 (Title/Escrow Est)`
*   **Total Selling Cost**: `Total Cost = Commission + Closing`
*   **Gross Equity**: `Gross = Sale Price - Mortgage Balance`
*   **Net Proceeds**: `Net = Gross - Total Cost`

### C. Advanced Mode Logic
Advanced mode calculates `Net Proceeds` by subtracting **all** enabled line items from `Sale Price`.

```javascript
Net Proceeds = Sale Price
             - (Realtor Commission % * Sale Price)
             - (Buyer Agent Commission % * Sale Price) // Split capability
             - Mortgage Payoff Exact
             - Second Lien / HELOC
             - Title Insurance Fee
             - Escrow / Settlement Fee
             - Transfer Taxes (State/County)
             - HOA Transfer/Proration
             - Home Warranty Cost
             - Staging Costs
             - Pre-listing Repairs
             - Negotiated Credits to Buyer
             - Transaction Coordinator Fee
             - Other Custom Fees
```

*Scenario Modeling*:
*   **Conservative**: `Net - (Sale Price * 2%)` (Buffer for negotiations)
*   **Aggressive**: `Net + (Sale Price * 1%)` (Bidding war)

---

## 3. Data Model (Supabase Schema)

### Tables

#### `leads` (Existing / Shared)
Captures the initial entry.
*   `id`: UUID (PK)
*   `email`: Text (Unique)
*   `zip_code`: Text
*   `created_at`: Timestamptz
*   `is_paid_user`: Boolean in `users` table or linked here.

#### `sheets`
Stores the user's specific calculation state.
*   `id`: UUID (PK)
*   `profile_id`: UUID (FK to auth.users or leads)
*   `mode`: Enum ('basic', 'advanced')
*   `sale_price`: Numeric
*   `mortgage_balance`: Numeric
*   `inputs`: JSONB (Stores all dynamic fields: commission_rate, repair_costs, etc.)
*   `last_updated`: Timestamptz
*   `payment_status`: Enum ('unpaid', 'paid')

#### `transactions`
Logs payments for Advanced Mode.
*   `id`: UUID
*   `sheet_id`: UUID
*   `stripe_payment_id`: Text
*   `amount`: Integer (499)
*   `currency`: 'usd'
*   `status`: 'succeeded'

---

## 4. UX Flow

### Step 1: The Hook (Landing)
*   **Visual**: Clean, hero section with immediate value prop. "Know your numbers before you list."
*   **Action**: 3 Simple Inputs centered on screen.
    1.  **Zip Code**
    2.  **Estimated Home Value**
    3.  **Mortgage Balance**
*   **CTA**: "Calculate Net Proceeds"

### Step 2: The Capture (Modal)
*   *Triggered on "Calculate" click.*
*   **Header**: "Unlock your estimate."
*   **Body**: "We'll send a copy of this report to your email so you don't lose it."
*   **Input**: Email Address.
*   **Action**: "Show My Numbers" -> Creates `lead`, creates `sheet` (basic), redirects to Results.

### Step 3: Basic Results (The "Free" Value)
*   **Layout**: 
    *   Top: Big bold "Estimated Net Proceeds".
    *   Middle: Stacked Bar Chart (Mortgage vs. Fees vs. Profit).
    *   Bottom: Breakdown (Sale Price, Total Costs, Payoff).
*   **Soft Gate**: "⚠️ These costs are national averages. Your actual closing costs could vary by thousands."
*   **Upsell Card**: "Want precision? Unlock Advanced Mode for $4.99 logic to add repairs, negotiated credits, and exact local fees."

### Step 4: The Upgrade (Checkout)
*   **Trigger**: Click "Unlock Advanced Mode".
*   **Integration**: Stripe Embedded Checkout ($4.99).
*   **Success**: Updates `payment_status`, redirects to Advanced Dashboard.

### Step 5: Advanced Dashboard (The Product)
*   **Layout**: Two-column layout (Desktop) / Tabbed (Mobile).
    *   **Left (Inputs)**: Accordion groups (Commissions, Loans, Title/Escrow, Prep/Repairs).
    *   **Right (Live Receipt)**: Sticky "Net Sheet" that updates in real-time as users type.
*   **Features**:
    *   Sliders for Commission (4% - 7%).
    *   Toggle for "Split with Buyer".
    *   PDF Download Button.
    *   "Email Me Link" (Magic Link to return).

---

## 5. Copy Suggestions & Micro-copy

**Labels:**
*   *Commission*: "Agent Fees" (Friendlier)
*   *Closing Costs*: "Transaction Fees"
*   *Net Proceeds*: "Cash in Pocket"

**Helper Text (Tooltips):**
*   *Title Insurance*: "Protects the buyer from past ownership claims. Usually paid by the seller in your area."
*   *Transfer Tax*: "A tax charged by the city or county to transfer the deed. We've estimated this based on your Zip."
*   *Staging*: "Money spent making the home look good (painting, furniture rental)."

**Disclaimer (Footer):**
"This is an estimate for planning purposes only. Actual net proceeds will vary based on final contract terms, prorations, and tax assessments. Consult a tax professional for capital gains implications."

---

## 6. Error Handling

| Scenario | UX Response |
| :--- | :--- |
| **Sale Price < Mortgage** | Warning Alert: "Short Sale Risk: Your mortgage is higher than the sale price. You may need to bring cash to close." |
| **Negative Net Proceeds** | Highlight "Cash to Close" in Red instead of Green. |
| **Unrealistic Commission (<1%)** | Input allowed, but show tooltip: "Typical commissions range from 4-6%. Ensure this is accurate." |
| **Invalid Zip** | "Please enter a valid 5-digit US Zip Code." |
| **Payment Fail** | "We couldn't process your card. No charge was made. Please try again." |

---

## 7. Future Expansion Hooks

**A. Agent Matching (Monetization)**
*   *Hook*: In Advanced Result, if the user hasn't selected an agent.
*   *CTA*: "Need an agent who charges fair fees? Match with a localized partner."

**B. "Edit Mode" for Agents**
*   *Feature*: Agents can create a branded version of the sheet for their clients.
*   *Data*: Add `agent_id` to `sheets` table.

**C. Market Data Injection**
*   *Feature*: Pull API data (e.g., Redfin/Zillow) to auto-fill "Estimated Home Value" based on address lookup.

**D. Capital Gains Calculator**
*   *Feature*: Add logic for "Cost Basis" and "Years Owned" to estimate tax liability on the profit.
