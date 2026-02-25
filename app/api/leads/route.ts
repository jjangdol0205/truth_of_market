import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
    try {
        const { email, source } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Insert into leads table (which allows anonymous inserts via RLS)
        const { error } = await supabase
            .from('leads')
            .insert([{ email, source: source || 'unknown' }]);

        if (error) {
            // Handle duplicate emails gracefully (unique constraint violation usually code 23505)
            if (error.code === '23505') {
                return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
            }
            console.error('Error inserting lead:', error);
            return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
        }

        // 2. Automated Email Delivery (Day 1 Welcome Sequence)
        if (resend) {
            try {
                // Ensure you verify a domain in Resend to send from a custom address, 
                // otherwise 'onboarding@resend.dev' works for testing to the registered email only.
                const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
                await resend.emails.send({
                    from: 'Truth of Market <onboarding@resend.dev>',
                    to: email,
                    subject: 'Welcome to Truth of Market 📉 (Your PDF is Here)',
                    html: `
                        <div style="font-family: sans-serif; color: #111;">
                            <h2>Welcome to Truth of Market.</h2>
                            <p>Thank you for subscribing. We expose the Wall Street narratives so you can see the actual fundamental truths of the market.</p>
                            
                            <hr style="border: 1px solid #eee; margin: 20px 0;" />
                            
                            <h3>🎁 Your Instant Download</h3>
                            <p>As promised, here is your exclusive access to the Top 10 High-Growth AI Stocks for 2026.</p>
                            <a href="${SITE_URL}/docs/top-10-ai-stocks-2026.pdf" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Download PDF Now</a>
                            
                            <hr style="border: 1px solid #eee; margin: 20px 0;" />
                            
                            <p>Keep an eye on your inbox tomorrow for a deep dive into how our AI model spots divergent market trends before institutional dumps.</p>
                            <p>Best,<br><strong>The Truth of Market Team</strong></p>
                            <p style="font-size: 11px; color: #666; margin-top: 30px;">You are receiving this because you opted in on our website.</p>
                        </div>
                    `
                });
                console.log(`Welcome email triggered to ${email}`);
            } catch (emailErr) {
                console.error('Failed to send welcome email via Resend:', emailErr);
                // We don't fail the whole request just because email failed, they are still a lead
            }
        } else {
            console.warn("RESEND_API_KEY not found. Skipping welcome email delivery.");
        }

        return NextResponse.json({ message: 'Successfully subscribed' }, { status: 200 });

    } catch (err: any) {
        console.error('Lead capture error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
