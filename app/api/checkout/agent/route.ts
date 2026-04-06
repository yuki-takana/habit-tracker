import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { razorpay } from '@/services/razorpay';
import { getSubscriptionConfig } from '@/app/action';

export async function POST(req: Request) {
    try {
        console.log('Received request for agent checkout');
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { agentId } = await req.json();

        if (!agentId) {
            return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
        }

        const configs = await getSubscriptionConfig();
        const price = parseFloat(configs.agent_price_inr) || 49;

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const amount = Math.round(price * 100); // converting to paise

        const options = {
            amount,
            currency: "INR",
            receipt: `rcpt_agent_${user.id.substring(0, 5)}_${Date.now()}`,
            notes: {
                userId: user.id,
                type: 'agentPurchase',
                agentId: agentId
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            userId: user.id,
            agentId: agentId
        });
    } catch (error: any) {
        console.error('Razorpay agent checkout error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
