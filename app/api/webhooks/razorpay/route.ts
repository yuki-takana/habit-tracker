import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { purchaseAgent } from '@/lib/agent-limits';

export async function POST(req: Request) {
    try {
        const bodyText = await req.text();
        if (!bodyText) return NextResponse.json({ error: 'Empty body' }, { status: 400 });

        const body = JSON.parse(bodyText);

        // Verify Webhook Signature
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
        const signature = req.headers.get('x-razorpay-signature') as string;

        if (!signature || !secret) {
            return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(bodyText)
            .digest('hex');

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = body.event;

        // Handle successful payments — both event types fire for a successful Razorpay payment
        if (event === 'payment.captured' || event === 'order.paid') {
            let userId: string | undefined;
            let type: string | undefined;
            let billingCycle: string | undefined;
            let agentId: string | undefined;
            let amountPaid = 0;

            if (event === 'payment.captured') {
                // payment.captured → notes are on the payment entity
                const payment = body.payload?.payment?.entity;
                userId = payment?.notes?.userId;
                type = payment?.notes?.type;
                billingCycle = payment?.notes?.billingCycle;
                agentId = payment?.notes?.agentId;
                amountPaid = payment?.amount ? payment.amount / 100 : 0;
            } else {
                // order.paid → notes are on the ORDER entity, not the payment
                const order = body.payload?.order?.entity;
                const payment = body.payload?.payment?.entity;
                userId = order?.notes?.userId;
                type = order?.notes?.type;
                billingCycle = order?.notes?.billingCycle;
                agentId = order?.notes?.agentId;
                amountPaid = payment?.amount ? payment.amount / 100 : 0;
            }

            console.log(`[Razorpay Webhook] Event: ${event} | userId: ${userId} | type: ${type} | billingCycle: ${billingCycle}`);

            if (userId) {
                if (type === 'agentPurchase') {
                    if (agentId) {
                        await purchaseAgent(userId, agentId, amountPaid);
                    }
                } else {
                    // Pro subscription — upsert with correct period
                    const periodToAdd = billingCycle === 'yearly' ? 365 : 30;

                    const existingSub = await prisma.subscription.findUnique({ where: { userId } });

                    let newEnd = new Date();
                    if (existingSub?.currentPeriodEnd && existingSub.currentPeriodEnd > new Date()) {
                        newEnd = new Date(existingSub.currentPeriodEnd.getTime());
                    }
                    newEnd.setDate(newEnd.getDate() + periodToAdd);

                    await prisma.subscription.upsert({
                        where: { userId },
                        create: {
                            userId,
                            status: 'active',
                            planId: 'pro',
                            currentPeriodStart: new Date(),
                            currentPeriodEnd: newEnd,
                        },
                        update: {
                            status: 'active',
                            planId: 'pro',
                            currentPeriodEnd: newEnd,
                        }
                    });
                    console.log(`[Razorpay Webhook] ✅ Subscription activated for userId: ${userId} until ${newEnd.toISOString()}`);
                }
            } else {
                console.warn(`[Razorpay Webhook] ⚠️ No userId found in notes for event: ${event}`);
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        console.error('Razorpay webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
