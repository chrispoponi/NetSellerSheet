import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        console.log("Attempting recovery for:", email);

        // Find most recent sheet
        const { data: sheet, error: dbError } = await supabase
            .from('seller_sheets')
            .select('*')
            .eq('email', email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (dbError || !sheet) {
            // Security: Don't reveal if email exists, just return success-ish or generic error
            console.log("No sheet found or error:", dbError);
            // We can return success to UI to prevent email enumeration, or specific error depending on preference.
            // For now, let's just return 404 internally but handle UI gracefully.
            return NextResponse.json({ error: "No calculation found for this email." }, { status: 404 });
        }

        // TRIGGER EMAIL
        // reuse the worker logic
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
        const host = process.env.VERCEL_URL || 'localhost:3000';
        const endpoint = `${protocol}://${host}/api/worker/send-email`;

        const payload = {
            email: sheet.email,
            sheetId: sheet.id,
            results: sheet.results_data,
            inputs: sheet.input_data
        };

        if (process.env.QSTASH_URL && process.env.QSTASH_TOKEN) {
            await fetch(`${process.env.QSTASH_URL}/v2/publish/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.QSTASH_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } else {
            console.warn("No QStash, requesting email directly.");
            // Fallback: direct invoke
            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(e => console.error("Direct recovery failed", e));
        }

        return NextResponse.json({ success: true, message: "Magic link sent" });

    } catch (e: any) {
        console.error("Recovery API Error:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
