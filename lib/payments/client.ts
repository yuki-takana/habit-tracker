import { getSubscriptionConfig } from "@/app/action";

// lib/payments/client.ts
export const openRazorpayCheckout = ({
    orderId,
    amount,
    name,
    description,
    onSuccess
}: any) => {
    const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name,
        description,
        order_id: orderId,
        handler: onSuccess,
        theme: { color: "#4f46e5" }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
};

export const activePaymentGateways = async () => {
    const config = await getSubscriptionConfig();
    if (config.active_payment_gateway === 'both') {
        return ['stripe', 'razorpay'];
    }
    return [config.active_payment_gateway, config.agent_price_inr];
};