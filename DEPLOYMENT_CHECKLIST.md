# NetSellerSheet.com - Pre-Flight Deployment Checklist

## 1. Stripe Configuration (Critical)
To enable payments, you must set these environment variables in Vercel (and `.env.local` for testing):

- `STRIPE_SECRET_KEY`: Get from Stripe Dashboard (Developers > API keys).
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Get from Stripe Dashboard.
- `STRIPE_WEBHOOK_SECRET`: 
  1. Go to Stripe Dashboard > Developers > Webhooks.
  2. Add Endpoint: `https://your-vercel-url.com/api/webhooks/stripe`.
  3. Select Events: `checkout.session.completed`.
  4. Copy the Signing Secret (`whsec_...`).

## 2. Supabase Database
Ensure your production Supabase instance has the required columns. Run this SQL in the Supabase SQL Editor if you haven't already:

```sql
-- Ensure columns exist for functionality
alter table seller_sheets add column if not exists input_data jsonb;
alter table seller_sheets add column if not exists is_paid boolean default false;
alter table seller_sheets add column if not exists mode text default 'basic'; -- 'advanced' or 'pro_bundle'
```

## 3. Environment Variables (Vercel)
Add all of these to your Vercel Project Settings:

| Variable | Value Source |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings (Service Role - Server side only!) |
| `QSTASH_TOKEN` | Upstash Console |
| `QSTASH_CURRENT_SIGNING_KEY` | Upstash Console |
| `QSTASH_NEXT_SIGNING_KEY` | Upstash Console |
| `RESEND_API_KEY` | Resend Console |
| `STRIPE_SECRET_KEY` | Stripe Console |
| `STRIPE_WEBHOOK_SECRET` | Stripe Console (After deploying!) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Console |

## 4. Verification Steps
After deploying:
1.  **Test Lead Capture**: Enter email, check if you get the "Welcome" email.
2.  **Test Basic Upsell ($4.99)**: Click "Advanced Mode" -> Checkout.
3.  **Test Pro Upsell ($9.99)**: Click "Refine" -> "Seller's Toolkit" -> Checkout.
4.  **Test Magic Link**: Click the link in your email (or manually append `?id=...`) to verify you can return to your data.
