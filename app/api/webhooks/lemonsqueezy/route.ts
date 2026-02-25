import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '../../../../utils/supabase/server';

export async function POST(req: Request) {
    try {
        // 1. Get raw body for HMAC signature verification
        const rawBody = await req.text();
        const signature = req.headers.get('x-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // 2. Verify Webhook Signature (Security)
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';
        const hmac = crypto.createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
        const signatureBuffer = Buffer.from(signature, 'utf8');

        if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // 3. Parse Validated Payload
        const payload = JSON.parse(rawBody);
        const eventName = payload.meta.event_name;

        // Custom Data passed from our Checkout URLs
        const customData = payload.meta.custom_data || {};
        const userId = customData.user_id;

        if (!userId) {
            console.error('Webhook received but no user_id found in custom_data');
            return NextResponse.json({ message: 'Processed without user_id' }, { status: 200 });
        }

        const supabase = await createClient();

        // 4. Handle Subscriptions based on Event
        if (eventName === 'subscription_created' || eventName === 'subscription_updated' || eventName === 'order_created') {
            const status = payload.data.attributes.status; // e.g. 'active', 'past_due', 'paused'

            // Update user in Supabase (You must ensure your 'users' table or a 'subscriptions' table has these columns)
            // Assuming we use Supabase auth.users raw_app_meta_data or a public profiles table.
            // Best practice: public.profiles table
            const { error } = await supabase
                .from('profiles') // Adjust according to your DB schema
                .upsert({
                    id: userId,
                    is_pro: status === 'active' || status === 'paid',
                    subscription_id: payload.data.id,
                    subscription_status: status,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error("Error updating user subscription:", error);
            }
        } else if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
            // Revoke Pro Access
            await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    is_pro: false,
                    subscription_status: 'cancelled',
                    updated_at: new Date().toISOString()
                });
        }

        return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

    } catch (err: any) {
        console.error('Webhook error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
