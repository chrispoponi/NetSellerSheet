import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sheetId, isPro } = body;

        if (!sheetId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        // Update the sheet status in DB
        const { error } = await supabase
            .from('seller_sheets')
            .update({
                is_paid: true,
                mode: isPro ? 'pro_bundle' : 'advanced' // simple mode tracking
            })
            .eq('id', sheetId);

        if (error) {
            console.error("Payment Update Error:", error);
            return NextResponse.json({ error: "Update failed" }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
