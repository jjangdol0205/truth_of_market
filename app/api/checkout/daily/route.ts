import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';

export async function GET(req: NextRequest) {
    // 1. Get the user session
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/?login=true', req.url));
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // 2. Define Lemon Squeezy Checkout URL for DAILY PLAN ($9.99)
    // You will need to replace this variant ID with your actual Daily Plan variant ID from Lemon Squeezy
    const variantId = process.env.LEMONSQUEEZY_DAILY_VARIANT_ID || "REPLACE_WITH_DAILY_VARIANT_ID";
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    // 3. Construct Checkout URL with Custom Data (User ID) for Webhook tracking
    // The checkout/buy link from Lemon Squeezy looks like: https://[store].lemonsqueezy.com/checkout/buy/[variant_id]
    // We append `?checkout[custom][user_id]=xxx` so the webhook knows WHO paid.

    // Fallback URL if env vars are missing (for testing UI)
    const storeUrl = process.env.LEMONSQUEEZY_STORE_URL || 'https://truthofmarket.lemonsqueezy.com';
    let checkoutUrl = `${storeUrl}/checkout/buy/${variantId}?checkout[custom][user_id]=${userId}&checkout[email]=${encodeURIComponent(userEmail || '')}`;

    return NextResponse.redirect(checkoutUrl);
}
