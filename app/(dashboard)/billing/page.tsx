import { getSubscriptionConfig } from '@/app/action';
import { getSubscriptionLimits } from '@/lib/subscription';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PricingClient from './PricingClient';

export default async function BillingPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/");

    const config = await getSubscriptionConfig();
    const limits = await getSubscriptionLimits(session.user.id);

    return (
        <>
            <PricingClient config={config} isPro={limits.isPro} />
        </>
    );
}
