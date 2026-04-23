import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * POST /api/checkout/razorpay/verify
 *
 * Called by the frontend Razorpay handler callback immediately after payment.
 * Verifies the payment signature and activates the subscription right away —
 * so the user doesn't have to wait for Razorpay's asynchronous webhook.
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, billingCycle } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
        }

        // ── Verify signature ──────────────────────────────────────────────────
        const secret = process.env.RAZORPAY_KEY_SECRET!;
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.error('[Razorpay Verify] ❌ Signature mismatch');
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // ── Activate subscription ─────────────────────────────────────────────
        const userId = session.user.id;
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
            },
        });

        console.log(`[Razorpay Verify] ✅ Subscription activated for ${userId} via payment ${razorpay_payment_id}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Razorpay Verify] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
