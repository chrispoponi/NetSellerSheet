import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Init Supabase (Service Role needed to bypass RLS if we wanted, but we unlocked RLS. 
// Using Service Role is safer for atomic updates usually, or standard client is fine if RLS allows.)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST() {
    try {
        // 1. Get current count
        // We assume row ID=1 exists (user must run seed SQL)
        // Check if row exists, if not create it
        let { data: row, error } = await supabase
            .from('site_traffic')
            .select('count')
            .eq('id', 1)
            .single();

        if (!row && !error) {
            // Maybe empty table? Insert seed.
            const { data: newRow } = await supabase
                .from('site_traffic')
                .insert({ count: 501, id: 1 }) // seeded
                .select()
                .single();
            row = newRow;
        }

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            console.error("Counter Valid Check Error:", error);
            // Fail gracefully, return estimated
            return NextResponse.json({ count: 500 });
        }

        // 2. Increment
        // We can do this atomically with rpc, or just read+write (good enough for this traffic level)
        // Or supabase .increment? Not directly in JS SDK v2 without rpc.
        // We'll just read + write + 1. 
        // Race conditions might miss a few hits, totally fine for "social proof".

        const currentCount = row ? row.count : 500;
        const newCount = currentCount + 1;

        await supabase
            .from('site_traffic')
            .update({ count: newCount, updated_at: new Date().toISOString() })
            .eq('id', 1);

        return NextResponse.json({ count: newCount });

    } catch (e) {
        console.error("Visit API Error:", e);
        return NextResponse.json({ count: 500 }); // Fallback
    }
}

export async function GET() {
    // Just read
    const { data: row } = await supabase
        .from('site_traffic')
        .select('count')
        .eq('id', 1)
        .single();

    return NextResponse.json({ count: row?.count || 500 });
}
