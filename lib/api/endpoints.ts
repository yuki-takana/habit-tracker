/**
 * ─────────────────────────────────────────────────────────
 *  API ENDPOINTS  — single source of truth for all routes
 *  Import from "@/lib/api" (barrel) or "@/lib/api/endpoints"
 * ─────────────────────────────────────────────────────────
 */

// ── Core ────────────────────────────────────────────────
export const ENDPOINTS = {
  // Auth / User
  CHECK_USER:            '/api/check-user',
  FCM_TOKEN:             '/api/fcm-token',
  USER_PASSWORD:         '/api/user/password',

  // Dashboard
  DASHBOARD_SUMMARY:     '/api/dashboard/summary',
  DASHBOARD_BLUEPRINTS:  '/api/dashboard/active-blueprints',

  // Habits
  HABITS:                '/api/habits',
  HABIT:                 (id: string) => `/api/habits/${id}`,

  // Todos
  TODOS:                 '/api/todos',
  TODO:                  (id: string) => `/api/todos/${id}`,

  // Tasks
  TASKS:                 '/api/tasks',
  TASK:                  (id: string) => `/api/tasks/${id}`,

  // Daily Goals
  DAILY_GOALS:           '/api/daily-goals',
  DAILY_GOALS_PREF:      '/api/daily-goals/preference',
  DAILY_GOALS_CRON:      '/api/cron/daily-goals',

  // Challenges
  CHALLENGES:            '/api/challenges',
  CHALLENGE:             (id: string) => `/api/challenges/${id}`,

  // Routines
  ROUTINES:              '/api/routines',
  ROUTINE:               (id: string) => `/api/routines/${id}`,
  ROUTINE_ACTIVATE:      (id: string) => `/api/routines/${id}/activate`,
  ROUTINE_TASKS:         (id: string) => `/api/routines/${id}/tasks`,
  ROUTINE_TASK:          (routineId: string, taskId: string) => `/api/routines/${routineId}/tasks/${taskId}`,

  // Workouts
  WORKOUT_PLANS:         '/api/workout-plans',
  WORKOUT_PLAN:          (id: string) => `/api/workout-plans/${id}`,
  EXERCISE_TOGGLE:       (workoutId: string) => `/api/exercises/${workoutId}/toggle-complete`,

  // Plans (generic)
  PLAN:                  (domain: string, id: string) => `/api/plans/${domain}/${id}`,
  PLAN_TASK:             (domain: string, planId: string, taskId: string) => `/api/plans/${domain}/${planId}/tasks/${taskId}`,

  // Domain-specific plans
  CAREER_PLAN:           (id: string) => `/api/career-plans/${id}`,
  CAREER_MILESTONE:      (planId: string, mId: string) => `/api/career-plans/${planId}/milestones/${mId}`,
  INCOME_PLAN:           (id: string) => `/api/income-plans/${id}`,
  INCOME_TASK:           (planId: string, taskId: string) => `/api/income-plans/${planId}/tasks/${taskId}`,
  PROJECT_PLAN:          (id: string) => `/api/project-plans/${id}`,
  PROJECT_TASK:          (planId: string, taskId: string) => `/api/project-plans/${planId}/tasks/${taskId}`,

  // Blueprint tasks
  BLUEPRINT_TASKS:       (planId: string) => `/api/blueprint/tasks/${planId}`,

  // Agents
  AGENT_BUSINESS:        '/api/agents/business',
  AGENT_CAREER:          '/api/agents/career',
  AGENT_GYM:             '/api/agents/gym',
  AGENT_HEALTH:          '/api/agents/health',
  AGENT_INCOME:          '/api/agents/income',
  AGENT_LEARNING:        '/api/agents/learning',
  AGENT_LIFE:            '/api/agents/life',
  AGENT_MINDSET:         '/api/agents/mindset',
  AGENT_NETWORKING:      '/api/agents/networking',
  AGENT_PRODUCTIVITY:    '/api/agents/productivity',
  AGENT_PROJECT:         '/api/agents/project',
  AGENT_RELATIONSHIPS:   '/api/agents/relationships',

  // Analytics
  ANALYTICS_CARD:        '/api/analytics/card',
  ANALYTICS_CARD_DUR:    (duration: string) => `/api/analytics/card?duration=${duration}`,

  // Subscription
  SUBSCRIPTION_LIMITS:   '/api/subscription/limits',
} as const;
