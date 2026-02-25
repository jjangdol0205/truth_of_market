import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.redirect(new URL('/?login=true', req.url));
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // 2. Define Lemon Squeezy Checkout URL for MONTHLY PLAN ($29.99)
    const variantId = process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID || "REPLACE_WITH_MONTHLY_VARIANT_ID";

    // Fallback URL if env vars are missing
    const storeUrl = process.env.LEMONSQUEEZY_STORE_URL || 'https://truthofmarket.lemonsqueezy.com';
    let checkoutUrl = `${storeUrl}/checkout/buy/${variantId}?checkout[custom][user_id]=${userId}&checkout[email]=${encodeURIComponent(userEmail || '')}`;

    return NextResponse.redirect(checkoutUrl);
}
