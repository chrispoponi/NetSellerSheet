import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, results, inputs } = body;

        // Validation
        if (!email || !results || !inputs) {
            console.error("Missing fields:", { email, results, inputs });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log("Submitting lead for:", email);

        // 1. Insert into seller_sheets (This stores the calculation)
        const { data: sheetData, error: sheetError } = await supabase
            .from('seller_sheets')
            .insert({
                input_data: inputs,
                results_data: results,
                email: email, // Correct column name based on DB error "null value in column email"
                is_paid: false,
                mode: 'basic'
            })
            .select('id')
            .single();

        if (sheetError) {
            console.error("Supabase 'seller_sheets' insert error:", sheetError);
            throw sheetError;
        }

        console.log("Sheet created with ID:", sheetData.id);

        // 2. Insert into Leads (if new, upsert)
        const { error: leadError } = await supabase
            .from('leads')
            .upsert({ email, last_calculated_at: new Date().toISOString() }, { onConflict: 'email' });

        if (leadError) {
            console.error("Supabase 'leads' upsert error:", leadError);
            // We don't block on this
        }

        // 3. Trigger Email Job (Async via QStash)
        if (process.env.QSTASH_URL && process.env.QSTASH_TOKEN) {
            try {
                // Use a proper absolute URL. In production VERCEL_URL is set, but no protocol.
                const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
                const host = process.env.VERCEL_URL || 'localhost:3000';
                const endpoint = `${protocol}://${host}/api/worker/send-email`;

                console.log("Triggering QStash to:", endpoint);

                const qstashRes = await fetch(`${process.env.QSTASH_URL}/v2/publish/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.QSTASH_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, sheetId: sheetData.id, results, inputs })
                });

                if (!qstashRes.ok) {
                    console.error("QStash API Error:", await qstashRes.text());
                } else {
                    console.log("QStash Trigger Success:", qstashRes.status);
                }
            } catch (qError) {
                console.error("QStash trigger failed:", qError);
                // Don't fail the request, just log it
            }
        } else {
            console.warn("QStash vars missing. Email job skipped.");
        }

        return NextResponse.json({ success: true, sheetId: sheetData.id });

    } catch (e: any) {
        console.error("CRITICAL API ERROR:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
