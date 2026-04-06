
import { NextResponse } from 'next/server';
import { stripe } from '@/services/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { purchaseAgent } from '@/lib/agent-limits';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error(`Webhook signature verification failed: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const userId = session.metadata?.userId;
        const type = session.metadata?.type;

        if (userId && type === 'agentPurchase') {
            const agentId = session.metadata?.agentId;
            const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
            if (agentId) {
                await purchaseAgent(userId, agentId, amountPaid);
            }
        }
        else if (userId && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;

            await prisma.subscription.upsert({
                where: { userId },
                create: {
                    userId,
                    stripeCustomerId: subscription.customer as string,
                    stripeSubscriptionId: subscription.id,
                    status: subscription.status,
                    planId: session.metadata?.planId || 'pro',
                    currentPeriodStart: new Date(subscription.current_period_start * 1000),
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                },
                update: {
                    stripeCustomerId: subscription.customer as string,
                    stripeSubscriptionId: subscription.id,
                    status: subscription.status,
                    planId: session.metadata?.planId || 'pro',
                    currentPeriodStart: new Date(subscription.current_period_start * 1000),
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                },
            });
        }
    }

    if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string) as any;

            await prisma.subscription.updateMany({
                where: {
                    stripeSubscriptionId: subscription.id,
                },
                data: {
                    status: subscription.status,
                    currentPeriodStart: new Date(subscription.current_period_start * 1000),
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                },
            });
        }
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as any;
        await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
            }
        })
    }

    return NextResponse.json({ received: true });
}
