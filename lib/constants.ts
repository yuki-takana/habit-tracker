export const DEFAULT_SUBSCRIPTION_CONFIG = {
    pro_monthly_price_usd: "4.99",
    pro_monthly_price_inr: "299",
    pro_yearly_price_usd: "39.99",
    pro_yearly_price_inr: "2499",
    agent_price_inr: "49",
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
export const XP_PER_MINUTE = 2;
export const XP_PER_HABIT = 10;
export const XP_PER_TODO = 15;
export const XP_PER_CHALLENGE = 50;
export const DAILY_XP_CAP = 200;
export const INACTIVITY_PENALTY = 20;
export const EARLY_BONUS_THRESHOLD_HOURS = 2;
export const LATE_PENALTY_THRESHOLD_HOURS = 0;
export const LATE_PENALTY_XP = 5;
export const MAX_DAILY_XP = 200;
export const XP_MULTIPLIER_PER_LEVEL = 1.1;
export const MAX_LEVEL = 50;
export const XP_FOR_LEVEL_UP = (level: number) => Math.floor(100 * Math.pow(XP_MULTIPLIER_PER_LEVEL, level - 1));