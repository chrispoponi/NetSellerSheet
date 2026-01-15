import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { formatCurrency } from '@/lib/utils';

const resendApiKey = process.env.RESEND_API_KEY!;
const resend = new Resend(resendApiKey);

async function handler(req: Request) {
    try {
        const { sheetId, email, results, inputs } = await req.json();

        if (!email || !results) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Email logic
        const netProceeds = formatCurrency(results.netProceeds);
        const salePrice = formatCurrency(inputs.salePrice);

        await resend.emails.send({
            from: 'Harvest Homes <results@netsellersheet.com>',
            replyTo: 'jackiepoponi@gmail.com',
            to: [email],
            subject: `Your home's numbers — now let's refine them 🌾`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #334155; line-height: 1.6;">
                    
                    <p>Hi there,</p>

                    <p>Thanks for using our <strong>Net Seller Sheet</strong> to get a clearer picture of what your home <em>could</em> sell for and what you might take home.</p>

                    <p>At <strong>Harvest Homes</strong>, we believe homeowners deserve visibility before making big decisions. Selling a home shouldn’t feel like guesswork or pressure — it should feel informed, calm, and on <em>your</em> terms.</p>

                    <p>That’s exactly why we built NetSellerSheet.com: to give you a realistic starting point before conversations ever begin.</p>

                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">

                    <h3 style="color: #0f172a; margin-bottom: 12px;">What your estimate is designed to do</h3>

                    <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                        <p style="margin: 0 0 8px 0;"><strong>Snapshot based on:</strong></p>
                        <p style="margin: 0; color: #0f172a;">Est. Value: <strong>${salePrice}</strong> &nbsp; | &nbsp; Est. Net: <strong style="color: #15803d;">${netProceeds}</strong></p>
                    </div>

                    <p>The numbers you just saw are meant to give you a <strong>clear, reasonable snapshot</strong> using smart national averages and transparent assumptions — not inflated figures or sales tactics.</p>

                    <p>It helps you:</p>
                    <ul style="padding-left: 20px;">
                        <li>Understand potential selling costs</li>
                        <li>See a realistic estimate of your net proceeds</li>
                        <li>Decide <em>if</em>, <em>when</em>, and <em>how</em> selling makes sense for you</li>
                    </ul>

                    <p>For many sellers, that clarity alone is enough to breathe easier.</p>

                    <h3 style="color: #0f172a; margin-top: 24px; margin-bottom: 12px;">Ready to refine your net sheet?</h3>

                    <p>If you’d like a more precise picture, you can <strong>Refine Your Net Sheet</strong> using our Advanced Mode.</p>

                    <p>This lets you dial in the details that matter most, including:</p>
                    <ul style="padding-left: 20px;">
                        <li>Custom realtor commissions</li>
                        <li>Exact closing and title fees</li>
                        <li>Repairs, credits, or concessions</li>
                        <li>Best-case, expected, and conservative scenarios</li>
                    </ul>

                    <p>It’s designed for sellers who want numbers they can actually plan around — not rough guesses.</p>

                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://netsellersheet.com'}?id=${sheetId}" style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            👉 Refine My Net Sheet
                        </a>
                    </div>

                    <h3 style="color: #0f172a; margin-top: 32px; margin-bottom: 12px;">When (and only when) you want help selling</h3>
                    
                    <p>If you decide you’d like support from a realtor, we handle that with the same care we put into our tools.</p>

                    <p>We personally speak with every realtor we recommend. We take time to understand how they work, how they communicate, and how they advocate for sellers — because you deserve someone who:</p>

                    <ul style="padding-left: 20px;">
                        <li>Understands your goals and timing</li>
                        <li>Protects your bottom line during negotiations</li>
                        <li>Makes the process feel manageable, not stressful</li>
                    </ul>

                    <p>If you choose to work with a realtor we introduce, we may earn a referral fee — but only if your home successfully sells. That keeps our interests aligned with yours.</p>

                    <p>There’s no obligation, no pressure, and no rush. We’re here when you’re ready.</p>

                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;">

                    <p style="margin-bottom: 4px;">Warm regards,</p>
                    <p style="margin-top: 0; font-weight: bold; color: #0f172a;">The Harvest Homes Team 🌾</p>
                    
                    <p style="font-size: 13px; color: #94a3b8; font-style: italic; margin-top: 24px;">
                        Clear numbers. Better decisions. Homes that move with confidence.
                    </p>
                </div>
            `
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Worker Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Export with QStash Verification (Uncomment in Production if QStash signing keys are set)
// export const POST = verifySignatureAppRouter(handler);

// For now (Dev/MVP), just export handler
export const POST = handler;
