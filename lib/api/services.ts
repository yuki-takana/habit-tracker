import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import { ENDPOINTS } from './endpoints';

// ── Habits ──────────────────────────────────────────────

export const habitsApi = {
  getAll: () => apiGet(ENDPOINTS.HABITS),

  create: (data: {
    name: string;
    category?: string;
    frequency?: string;
    targetType?: string;
    targetValue?: number;
    targetUnit?: string;
  }) => apiPost(ENDPOINTS.HABITS, data as any),

  update: (id: string, data: Record<string, unknown>) =>
    apiPatch(ENDPOINTS.HABIT(id), data),

  delete: (id: string) => apiDelete(ENDPOINTS.HABIT(id)),
};

// ── Todos ────────────────────────────────────────────────

export const todosApi = {
  getAll: () => apiGet(ENDPOINTS.TODOS),

  create: (data: {
    task: string;
    category?: string;
    priority?: number;
    startTime?: string;
    deadline?: string;
    plannedTime?: number;
    linkedTo?: string;
    reasoning?: string;
  }) => apiPost(ENDPOINTS.TODOS, data as any),

  update: (id: string, data: Record<string, unknown>) =>
    apiPatch(ENDPOINTS.TODO(id), data),

  toggleComplete: (id: string, completed: boolean) =>
    todosApi.update(id, { completed }),

  start: (id: string) =>
    todosApi.update(id, { startedAt: new Date().toISOString(), status: 'in_progress' }),

  fail: (id: string) =>
    todosApi.update(id, { status: 'failed' }),

  delay: (id: string, startTime: string, deadline: string | undefined, delayCount: number) =>
    todosApi.update(id, {
      startTime,
      ...(deadline && { deadline }),
      delayCount,
      lastDelayedAt: new Date().toISOString(),
      status: 'upcoming',
    }),
};

// ── Tasks ────────────────────────────────────────────────

export const tasksApi = {
  create: (data: { title: string; description?: string; status?: string }) =>
    apiPost(ENDPOINTS.TASKS, data as any),

  update: (id: string, data: Record<string, unknown>) =>
    apiPatch(ENDPOINTS.TASK(id), data),
};

// ── Challenges ───────────────────────────────────────────

export const challengesApi = {
  getAll: () => apiGet(ENDPOINTS.CHALLENGES),

  create: (data: {
    title: string;
    focus?: string;
    durationDays?: number;
    startDate?: string;
  }) => apiPost(ENDPOINTS.CHALLENGES, data as any),

  delete: (id: string) => apiDelete(ENDPOINTS.CHALLENGE(id)),
};

// ── Routines ─────────────────────────────────────────────

export const routinesApi = {
  getAll: () => apiGet(ENDPOINTS.ROUTINES),

  create: (data: Record<string, unknown>) =>
    apiPost(ENDPOINTS.ROUTINES, data),

  update: (id: string, data: Record<string, unknown>) =>
    apiPatch(ENDPOINTS.ROUTINE(id), data),

  delete: (id: string) => apiDelete(ENDPOINTS.ROUTINE(id)),

  activate: (id: string) => apiPost(ENDPOINTS.ROUTINE_ACTIVATE(id)),

  getTasks: (id: string) => apiGet(ENDPOINTS.ROUTINE_TASKS(id)),

  addTask: (id: string, data: Record<string, unknown>) =>
    apiPost(ENDPOINTS.ROUTINE_TASKS(id), data),

  updateTask: (routineId: string, taskId: string, data: Record<string, unknown>) =>
    apiPatch(ENDPOINTS.ROUTINE_TASK(routineId, taskId), data),

  deleteTask: (routineId: string, taskId: string) =>
    apiDelete(ENDPOINTS.ROUTINE_TASK(routineId, taskId)),
};

// ── Daily Goals ──────────────────────────────────────────

export const dailyGoalsApi = {
  get: () => apiGet(ENDPOINTS.DAILY_GOALS),

  generate: (data?: Record<string, unknown>) =>
    apiPost(ENDPOINTS.DAILY_GOALS, data),

  getPreference: () => apiGet(ENDPOINTS.DAILY_GOALS_PREF),

  updatePreference: (data: Record<string, unknown>) =>
    apiPost(ENDPOINTS.DAILY_GOALS_PREF, data),

  runCron: () => apiPost(ENDPOINTS.DAILY_GOALS_CRON),
};

// ── Plans ────────────────────────────────────────────────

export const plansApi = {
  // Generic plan (uses /api/plans/:domain/:id)
  get: (domain: string, id: string) => apiGet(ENDPOINTS.PLAN(domain, id)),
  toggleTask: (domain: string, planId: string, taskId: string) =>
    apiPatch(ENDPOINTS.PLAN_TASK(domain, planId, taskId)),

  // Career
  career: {
    get: (id: string) => apiGet(ENDPOINTS.CAREER_PLAN(id)),
    toggleMilestone: (planId: string, mId: string) =>
      apiPatch(ENDPOINTS.CAREER_MILESTONE(planId, mId)),
  },

  // Income
  income: {
    get: (id: string) => apiGet(ENDPOINTS.INCOME_PLAN(id)),
    toggleTask: (planId: string, taskId: string) =>
      apiPatch(ENDPOINTS.INCOME_TASK(planId, taskId)),
  },

  // Project
  project: {
    get: (id: string) => apiGet(ENDPOINTS.PROJECT_PLAN(id)),
    toggleTask: (planId: string, taskId: string) =>
      apiPatch(ENDPOINTS.PROJECT_TASK(planId, taskId)),
  },

  // Workout
  workout: {
    get: (id: string) => apiGet(ENDPOINTS.WORKOUT_PLAN(id)),
    toggleExercise: (workoutId: string) =>
      apiPost(ENDPOINTS.EXERCISE_TOGGLE(workoutId)),
  },

  // Blueprint tasks
  blueprintTasks: (planId: string) => apiGet(ENDPOINTS.BLUEPRINT_TASKS(planId)),
};

// ── Agents ───────────────────────────────────────────────

type AgentName =
  | 'business' | 'career' | 'gym' | 'health' | 'income'
  | 'learning' | 'life' | 'mindset' | 'networking'
  | 'productivity' | 'project' | 'relationships';

const AGENT_MAP: Record<AgentName, string> = {
  business:       '/api/agents/business',
  career:         '/api/agents/career',
  gym:            '/api/agents/gym',
  health:         '/api/agents/health',
  income:         '/api/agents/income',
  learning:       '/api/agents/learning',
  life:           '/api/agents/life',
  mindset:        '/api/agents/mindset',
  networking:     '/api/agents/networking',
  productivity:   '/api/agents/productivity',
  project:        '/api/agents/project',
  relationships:  '/api/agents/relationships',
};

export const agentsApi = {
  invoke: (agent: AgentName, data: Record<string, unknown>) =>
    apiPost(AGENT_MAP[agent], data),
};

// ── Analytics ────────────────────────────────────────────

export const analyticsApi = {
  getCard: (duration?: string) =>
    apiGet(duration ? ENDPOINTS.ANALYTICS_CARD_DUR(duration) : ENDPOINTS.ANALYTICS_CARD),
};

// ── Subscription ─────────────────────────────────────────

export const subscriptionApi = {
  getLimits: () => apiGet(ENDPOINTS.SUBSCRIPTION_LIMITS),
};

// ── Dashboard ────────────────────────────────────────────

export const dashboardApi = {
  getSummary: () => apiGet(ENDPOINTS.DASHBOARD_SUMMARY),
  getActiveBlueprints: () => apiGet(ENDPOINTS.DASHBOARD_BLUEPRINTS),
};

// ── User / Auth ──────────────────────────────────────────

export const userApi = {
  check: () => apiGet(ENDPOINTS.CHECK_USER),
  saveFcmToken: (token: string) => apiPost(ENDPOINTS.FCM_TOKEN, { token } as any),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiPost(ENDPOINTS.USER_PASSWORD, data as any),
};
