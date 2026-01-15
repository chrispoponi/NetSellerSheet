import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

// Init Supabase with Service Role to read any sheet by ID
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('seller_sheets')
            .select('input_data, is_paid, email, mode')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Fetch Sheet Error:", error);
            return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
        }

        // Return the clean data structure expected by frontend
        return NextResponse.json({
            inputs: data.input_data,
            is_paid: data.is_paid,
            mode: data.mode,
            email: data.email
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
