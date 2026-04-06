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

        // We only care about successful payments for our orders
        if (event === 'payment.captured' || event === 'order.paid') {
            const payment = body.payload.payment.entity;
            const userId = payment.notes?.userId;
            const type = payment.notes?.type;

            if (userId) {
                if (type === 'agentPurchase') {
                    const agentId = payment.notes?.agentId;
                    const amountPaid = payment.amount ? payment.amount / 100 : 0;
                    if (agentId) {
                        await purchaseAgent(userId, agentId, amountPaid);
                    }
                } else {
                    const billingCycle = payment.notes?.billingCycle; // "monthly" | "yearly"
                    const periodToAdd = billingCycle === 'yearly' ? 365 : 30; // days

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
                }
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        console.error('Razorpay webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
