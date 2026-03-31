export const DEFAULT_SUBSCRIPTION_CONFIG = {
    pro_monthly_price_usd: "4.99",
    pro_monthly_price_inr: "299",
    pro_yearly_price_usd: "39.99",
    pro_yearly_price_inr: "2499",
    free_habit_limit: "3",
    free_blueprint_limit: "1",
    active_payment_gateway: "both", // "stripe" | "razorpay" | "both"
    feature_dashboard: "true",
    feature_insights: "true",
    feature_habits: "true",
    feature_todos: "true",
    feature_challenges: "true",
    feature_workouts: "true",
    feature_daily_goals: "true",
    whatsapp_provider: "meta" // "meta" | "twilio" | "local"
};

export enum SessionStatus {
    RUNNING = "RUNNING",
    PAUSED = "PAUSED",
    COMPLETED = "COMPLETED"
}

export const REMINDER_LEAD_TIME_MINS = 5;