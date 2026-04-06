import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/services/stripe';
import { getSubscriptionConfig } from '@/app/action';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { agentId, agentName } = await req.json();

        if (!agentId) {
            return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
        }

        const configs = await getSubscriptionConfig();
        const priceInr = parseFloat(configs.agent_price_inr) || 49;
        
        // Convert dynamic INR pricing to Stripe price payload in closest valid currency
        // Assuming INR -> USD is roughly `/ 83` for fallback or just using INR.
        // We'll use INR to match Razorpay.
        const amountPaise = Math.round(priceInr * 100);

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.email!,
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Agent Unlock: ${agentName || agentId}`,
                            description: 'Gain full access to this premium agent.',
                        },
                        unit_amount: amountPaise,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/blueprint?agent_success=true&agent_id=${agentId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/blueprint?agent_canceled=true`,
            metadata: {
                userId: user.id,
                type: 'agentPurchase',
                agentId: agentId
            }
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error: any) {
        console.error('Stripe agent checkout error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
