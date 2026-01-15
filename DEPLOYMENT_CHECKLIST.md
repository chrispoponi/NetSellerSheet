# Final Deployment Checklist

Your NetSellerSheet is fully updated with the new Navy UI, Excel Scenarios, and Recovery logic. Follow these steps to ensure a flawless production launch.

## 1. Environment Variables (Vercel)
Ensure the following variables are set in your Vercel Project Settings:

- `NEXT_PUBLIC_SUPABASE_URL`: (Your Supabase URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
- `SUPABASE_SERVICE_ROLE_KEY`: (Your Supabase Service Role Key)
- `STRIPE_SECRET_KEY`: (Your **Live** Stripe Secret Key `sk_live_...`)
- `STRIPE_WEBHOOK_SECRET`: (From Stripe Dashboard > Webhooks)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: (Your **Live** Publishable Key `pk_live_...`)
- `RESEND_API_KEY`: (Your Resend API Key)
- `QSTASH_URL`: (Your QStash URL)
- `QSTASH_TOKEN`: (Your QStash Token)
- `NEXT_PUBLIC_APP_URL`: `https://netsellersheet.com` (Or your vercel domain)

## 2. Stripe Webhook Configuration
1. Go to Stripe Dashboard > Developers > Webhooks.
2. Add Endpoint: `https://your-vercel-domain.com/api/webhooks/stripe`
3. Select Events: `checkout.session.completed`
4. Copy the Signing Secret (`whsec_...`) to Vercel `STRIPE_WEBHOOK_SECRET`.

## 3. Verify Email Settings
- **From:** `results@netsellersheet.com` (Ensure this domain is verified in Resend)
- **Reply-To:** `jackiepoponi@gmail.com` (Confirmed in code)

## 4. Test the Flow
1. **Free Calculation:** Enter address, see results. Check if email arrives with correct "Refine" link (`?id=...`).
2. **Excel Download (Landing):** Click "Download Master Excel" -> Should prompt Upsell.
3. **Advanced Mode:** Click "Advanced Mode" tab -> Should prompt Upsell.
4. **Recovery:** Click User Icon (Top Right) -> Enter email -> Check if "Magic Link" email arrives.

## 5. Domain DNS
Ensure `netsellersheet.com` A/CNAME records point to Vercel.

## 6. Deployment
Run `npx vercel --prod` in your terminal or push to GitHub to trigger deployment.
