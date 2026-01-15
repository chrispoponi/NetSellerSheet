import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Init Supabase Service Role
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const secret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, secret);
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const sheetId = session.metadata?.sheetId;
        const tier = session.metadata?.tier;

        if (sheetId) {
            console.log(`Payment successful for Sheet ${sheetId} (Tier: ${tier})`);

            // Update DB
            const { error } = await supabase
                .from('seller_sheets')
                .update({
                    is_paid: true,
                    mode: tier === 'pro' ? 'pro_bundle' : 'advanced'
                })
                .eq('id', sheetId);

            if (error) {
                console.error("Supabase Update Error:", error);
                return NextResponse.json({ error: "DB Update Failed" }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true });
}
