import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICES } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sheetId, tier } = body; // tier: 'basic' | 'pro'

        if (!sheetId || !tier) {
            return NextResponse.json({ error: "Missing required params" }, { status: 400 });
        }

        const priceConfig = tier === 'pro' ? PRICES.PRO_BUNDLE : PRICES.BASIC_UNLOCK;

        // Base URL helper
        const origin = req.headers.get('origin') || 'https://netsellersheet.com';

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: priceConfig.name,
                            description: tier === 'pro'
                                ? 'Includes Advanced Mode, PDF Report, and Excel Calculator'
                                : 'Includes Advanced Mode and PDF Report'
                        },
                        unit_amount: priceConfig.amount,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                sheetId: sheetId,
                tier: tier
            },
            success_url: `${origin}/?id=${sheetId}&payment_success=true`,
            cancel_url: `${origin}/?id=${sheetId}&payment_cancelled=true`,
        });

        return NextResponse.json({ url: session.url });

    } catch (err: any) {
        console.error("Stripe Checkout Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
