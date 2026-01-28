import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICES } from "@/lib/stripe";

/**
 * Direct checkout endpoint for purchasing products without an existing sheet.
 * This is useful for direct links to products (e.g., the Excel toolkit).
 * 
 * Usage: POST /api/checkout-direct with body { tier: 'pro' | 'basic', email?: string }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tier, email } = body; // tier: 'basic' | 'pro', email is optional

        if (!tier) {
            return NextResponse.json({ error: "Missing tier parameter" }, { status: 400 });
        }

        const priceConfig = tier === 'pro' ? PRICES.PRO_BUNDLE : PRICES.BASIC_UNLOCK;

        // Base URL helper
        const origin = req.headers.get('origin') || 'https://netsellersheet.com';

        const sessionConfig: any = {
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: priceConfig.name,
                            description: tier === 'pro'
                                ? 'Master Excel Calculator with Moving Checklist + Advanced Mode Unlock'
                                : 'Advanced Mode with PDF Report'
                        },
                        unit_amount: priceConfig.amount,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                tier: tier,
                source: 'direct_link'
            },
            success_url: `${origin}/purchase-success?tier=${tier}`,
            cancel_url: `${origin}/`,
        };

        // If email provided, prefill it
        if (email) {
            sessionConfig.customer_email = email;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return NextResponse.json({ url: session.url });

    } catch (err: any) {
        console.error("Stripe Direct Checkout Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
