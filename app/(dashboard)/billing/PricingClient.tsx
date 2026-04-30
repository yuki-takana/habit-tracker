"use client"

import React, { useState } from 'react';
import { Check, Sparkles, CreditCard, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UflLoaderInline } from '@/components/ui/ufl-loader';

export default function PricingClient({ config, isPro }: { config: any, isPro: boolean }) {
    const [cycle, setCycle] = useState<'monthly' | 'yearly'>('yearly');
    const [loadingStripe, setLoadingStripe] = useState(false);
    const [loadingRazorpay, setLoadingRazorpay] = useState(false);

    const priceUsd = cycle === 'yearly' ? config.pro_yearly_price_usd : config.pro_monthly_price_usd;
    const priceInr = cycle === 'yearly' ? config.pro_yearly_price_inr : config.pro_monthly_price_inr;

    const handleStripe = async () => {
        setLoadingStripe(true);
        try {
            const res = await fetch('/api/checkout/stripe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ billingCycle: cycle })
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else toast.error(data.error || "Failed to initiate checkout");
        } catch (e) {
            toast.error("An error occurred");
        }
        setLoadingStripe(false);
    };

    const handleRazorpay = async () => {
        setLoadingRazorpay(true);
        try {
            const res = await fetch('/api/checkout/razorpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ billingCycle: cycle })
            });
            const data = await res.json();

            if (data.orderId) {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourTestKey',
                    amount: data.amount,
                    currency: data.currency,
                    name: "UFL Habit AI",
                    description: `Pro Plan (${cycle})`,
                    order_id: data.orderId,
                    handler: async function (response: any) {
                        // Verify & activate subscription immediately — don’t wait for async webhook
                        toast.loading("Activating your Pro plan...", { id: "rzp-verify" });
                        try {
                            const verifyRes = await fetch('/api/checkout/razorpay/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    billingCycle: cycle,
                                }),
                            });
                            const verifyData = await verifyRes.json();
                            if (verifyData.success) {
                                toast.success("🎉 You're now Pro! Welcome to UFL Pro.", { id: "rzp-verify" });
                            } else {
                                toast.warning("Payment received — plan will activate shortly.", { id: "rzp-verify" });
                            }
                        } catch {
                            toast.warning("Payment received — plan will activate shortly.", { id: "rzp-verify" });
                        }
                        setTimeout(() => window.location.href = '/dashboard', 2000);
                    },
                    theme: { color: "#4f46e5" }
                };
                // @ts-ignore
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                toast.error(data.error || "Failed to initialize Razorpay");
            }
        } catch (e) {
            toast.error("An error occurred");
        }
        setLoadingRazorpay(false);
    };

    const features = [
        "Unlimited Habits Tracking",
        "Unlimited AI Blueprint Generations",
        "Global WhatsApp Reminders",
        "Advanced Analytics & Insights",
        "Premium WakaTime & GitHub Integrations",
        "Priority Email Support"
    ];

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-3">
                    <Sparkles className="w-10 h-10 text-indigo-500" />
                    Unlock Ultimate Potential
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    Take full control of your life. Remove limits on habits, unlock the full AI agent army, and get powerful insights.
                </p>
            </div>

            <div className="flex justify-center mb-12">
                <div className="bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl flex items-center border border-slate-200 dark:border-zinc-800">
                    <button
                        onClick={() => setCycle('monthly')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${cycle === 'monthly' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setCycle('yearly')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${cycle === 'yearly' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        Yearly <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] uppercase font-black tracking-widest">Save 30%</span>
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <div className="rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-2xl shadow-indigo-500/20">
                    <div className="bg-white dark:bg-zinc-950 rounded-[2.4rem] p-8 md:p-12 relative overflow-hidden">

                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl -mr-20 -mt-20 rounded-full" />

                        {isPro && (
                            <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <Check size={14} /> Active Plan
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pro Membership</h3>
                            <div className="flex items-end gap-3">
                                <div className="text-5xl font-black text-slate-900 dark:text-white">
                                    ₹{priceInr}
                                    <span className="text-2xl text-slate-400 font-medium">
                                        / {cycle === 'monthly' ? 'mo' : 'yr'}
                                    </span>
                                </div>
                            </div>

                            <div className="text-sm text-slate-500 font-medium mt-1">
                                ≈ ${priceUsd} {cycle === 'monthly' ? 'per month' : 'per year'}
                            </div>
                        </div>

                        <div className="space-y-4 mb-10">
                            {features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {!isPro ? (
                            <div className="space-y-4">
                                {(config.active_payment_gateway === 'both' || config.active_payment_gateway === 'stripe') && (
                                    <Button
                                        onClick={handleStripe}
                                        disabled={loadingStripe || loadingRazorpay}
                                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-all shadow-xl shadow-indigo-500/30 active:scale-[0.98] flex items-center gap-2"
                                    >
                                        {loadingStripe ? <UflLoaderInline style="pulse-dots" compact /> : <CreditCard size={20} />}
                                        Pay Now
                                    </Button>
                                )}

                                {(config.active_payment_gateway === 'both' || config.active_payment_gateway === 'razorpay') && (
                                    <Button
                                        onClick={handleRazorpay}
                                        disabled={loadingStripe || loadingRazorpay}
                                        variant="outline"
                                        className="w-full h-14 rounded-2xl border-slate-200 dark:border-zinc-800 bg-transparent hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-900 dark:text-white font-bold text-lg transition-all active:scale-[0.98] flex items-center gap-2"
                                    >
                                        {loadingRazorpay ? <UflLoaderInline style="pulse-dots" compact /> : <Wallet size={20} />}
                                        Pay Now
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                                <p className="text-indigo-600 dark:text-indigo-400 font-bold">You are already a Pro member.</p>
                                <p className="text-sm text-indigo-600/70 dark:text-indigo-400/70 mt-1">Enjoy unlimited features and the AI Agent Army!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

