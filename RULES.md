# Habit Tracker — Game Design Rule System v1.1
> The definitive ruleset governing XP, levels, streaks, trees, shields, and the forest.
> This document is the single source of truth. All game logic must implement exactly these rules.

---

## 1. Core Philosophy

Three rules above everything:

1. **Progress must always feel possible** — even on bad days, the user earns something
2. **Loss must sting but never break** — penalties exist, but the floor is zero
3. **Consistency beats perfection** — a 60% day still counts as a streak day

---

## 2. XP — Earning

### 2.1 Base Todo Completion

| Condition | XP Earned |
|---|---|
| Complete any todo before deadline | +10 XP |
| Complete todo early (≥ 2 hrs before deadline) | +15 XP |
| Complete AI-generated todo | +12 XP (AI bonus) |
| First todo completed of the day | +5 XP (momentum bonus) |
| Complete all todos for the day | +25 XP (perfect day bonus) |
| Perfect day + streak ≥ 7 | +35 XP (hot streak bonus) |

### 2.2 Streak Milestone Bonuses

| Streak | Bonus XP | Reward |
|---|---|---|
| 3 days | +30 XP | Bronze flame unlocked |
| 7 days | +100 XP | Silver flame + 1 shield |
| 14 days | +200 XP | Gold flame + 1 shield |
| 30 days | +500 XP | Diamond flame + rare tree skin |
| 60 days | +750 XP | Purple flame + animated tree skin |
| 90 days | +1500 XP | Legendary flame + permanent badge |

### 2.3 Level Milestone Bonuses

| Level Reached | Bonus XP |
|---|---|
| Level 3 | +150 XP + 1 shield |
| Level 5 | +300 XP + 1 shield |
| Level 7 | +500 XP + rare forest slot |
| Level 9 | +750 XP + 1 shield |
| Level 10 | +1000 XP + legend badge |

### 2.4 Special Bonuses

| Action | XP |
|---|---|
| Daily login (app open) | +3 XP |
| Weekly Boss Challenge completed | +250 XP |
| Complete a habit 30 days in a row | +400 XP + tree skin |
| Ghost tree revived (3 consecutive days) | +80 XP |
| Completing reflection todo | +15 XP |

---

## 3. XP — Deductions

### 3.1 Miss Penalties

| Condition | XP Deducted |
|---|---|
| Miss a single todo (deadline passed) | −5 XP |
| Miss all todos for the day | −20 XP |
| Streak breaks (no shield) | −50 XP |
| Streak shield activated (manual/auto) | −30 XP (cost of protection) |
| Inactive for 7 consecutive days | −5% of total XP per day after day 7 |

### 3.2 Floor Rule

**Total XP can never go below 0.**
If a deduction would push total XP negative, clamp at 0.
```
finalXP = Math.max(0, currentXP - deduction)
```

### 3.3 Level Regression

Levels do NOT regress with XP loss. Once a level is reached it is permanent.
XP loss only affects current-level progress bar, not the level number itself.

---

## 4. XP Formula Reference
```
// Base todo completion
xpEarned = isAIGenerated ? 12 : 10
xpEarned += isEarly ? 5 : 0          // Early completion bonus
xpEarned += isFirstOfDay ? 5 : 0     // Momentum bonus

// Perfect day bonus (calculated at midnight)
if (completedTodos / totalTodos >= 1.0) {
  xpEarned += streak >= 7 ? 35 : 25
}

// Deduction on miss
xpDeducted = isMissedDay ? 20 : 5
finalXP = Math.max(0, currentXP - xpDeducted)

// Streak break
if (streakBroken && shields === 0) {
  finalXP = Math.max(0, currentXP - 50)
}

// Inactivity decay (starts day 8)
if (inactiveDays > 7) {
  decayPerDay = Math.floor(currentXP * 0.05)
  finalXP = Math.max(0, currentXP - decayPerDay)
}
```

---

## 5. Level System

Levels never reset. XP is cumulative lifetime.

| Level | XP Required | Title | Perk |
|---|---|---|---|
| 1 | 0 | Seed | App access |
| 2 | 150 | Sprout | Custom reminder time |
| 3 | 400 | Sapling | +1 Shield slot, AI breakdown |
| 4 | 800 | Branch | Weekly boss unlocked |
| 5 | 1,400 | Tree | +1 Shield slot, custom tree skin |
| 6 | 2,200 | Grove | Forest view unlocked |
| 7 | 3,400 | Forest | Rare tree seeds, +1 forest slot |
| 8 | 5,000 | Elder | XP multiplier x1.1 on all actions |
| 9 | 7,200 | Ancient | +1 Shield slot |
| 10 | 10,000 | Legend | XP multiplier x1.25, legend badge |

### Level Multiplier Rule

At Level 8+, all XP earned is multiplied:
```
finalXPEarned = baseXP * levelMultiplier
// Level 8: x1.1
// Level 9: x1.1
// Level 10: x1.25
```

Multiplier does NOT apply to penalty deductions — penalties are always face value.

> ⚠️ **Free Tier Restriction**: XP multipliers (Level 8+) are visible but produce no effect for free users. A "Pro only" badge is shown next to the multiplier in the UI. This is intentional — it creates a visible loss at a high-investment moment, maximizing upgrade motivation.

---

## 6. Streak System

### 6.1 What Counts as a Streak Day

A day counts toward the streak if the user completes **≥ 60% of that day's todos** before midnight in their local timezone.
```
streakCounts = (completedTodos / totalTodos) >= 0.60
```

This is intentional. 60% not 100% — reduces anxiety, rewards consistency over perfection.

### 6.2 Streak Reset Conditions

Streak resets to 0 when:
- User completes < 60% of todos for a calendar day
- AND no streak shield is available or activated
- AND user does not restore via payment (see §18.2)

### 6.3 Grace Period Rule

Once every 30 days, the user gets one automatic grace period:
- If they miss a day but complete **200% of normal todos the next day** (double), the streak is preserved
- Grace period is automatically consumed — no manual trigger needed
- Grace period recharges 30 days after last use
```
graceActive = (daysSinceLastGrace >= 30)
graceUsed = (tomorrowCompletion >= totalTodos * 2)
if (graceActive && graceUsed) preserveStreak()
```

### 6.4 Streak Milestones

Milestones trigger at exact streak day counts. Rewards are given once per milestone per lifetime (not per streak cycle).

---

## 7. Streak Shield System

### 7.1 Earning Shields

| Source | Shields Awarded |
|---|---|
| Every 14-day streak milestone | +1 Shield |
| Level 3 reached | +1 Shield |
| Level 5 reached | +1 Shield |
| Level 9 reached | +1 Shield |
| Weekly Boss Challenge win | +1 Shield |

### 7.2 Shield Cap

Maximum **3 shields** held at any time. Excess shields earned beyond 3 are discarded.

### 7.3 Using a Shield

- Activates automatically when a streak-breaking miss is detected at midnight
- User can toggle auto-use ON or OFF in settings
- If auto-use is OFF, user gets a push notification with a 15-minute window to manually activate
- Costs **−30 XP** on activation regardless of manual or auto
- Streak is preserved exactly as if the day was completed
- Shield is consumed (−1 from count)
- Tree for that habit does NOT shrink when shield activates
```
if (streakWouldBreak && shields > 0 && autoShield) {
  shields -= 1
  xp = Math.max(0, xp - 30)
  streak += 0  // preserved, not incremented
  notifyUser("Shield activated. Streak safe. −30 XP")
}
```

### 7.4 Shield Behaviour — Free vs Pro

**Free users** who have a shield available when a streak breaks face a **choice gate**:

> The shield exists in their inventory, but they cannot use it for free.

When a streak break is detected for a free user with ≥ 1 shield:

1. Shield does **NOT** auto-activate
2. User receives a notification (see §7.5)
3. User is presented with two options inside the app:
   - **"Use Shield — ₹9"** → One-time payment. Shield is consumed, streak preserved, −30 XP applied as normal.
   - **"Go Pro — ₹149/mo"** → Subscription. Shield activates immediately. All Pro features unlocked.
4. If user dismisses the gate without paying, streak resets as normal (−50 XP, shield is NOT consumed).

> Rationale: The shield is earned through gameplay — taking it away entirely feels unfair. Making it a pay-to-activate feature at the exact moment of streak loss is high-conversion, low-resentment. The user still "has" their shield; they just need to unlock the ability to use it.

### 7.5 Shield Notification Copy

**Pro users:**
> "Your shield blocked tonight's miss. Streak protected. −30 XP. 🛡️ [X] shields remaining."

**Free users (shield available):**
> "Your [X]-day streak broke. 💔 You have a shield — use it for ₹9 or go Pro to unlock shields forever."

**Free users (no shield):**
> "Your [X]-day streak broke. 😔 Go Pro to protect future streaks with shields."

---

## 8. Tree System

### 8.1 Tree Lifecycle

Each habit/challenge gets its own tree. The tree state is independent per habit.

### 8.2 Growth Stages

| Stage | Name | Condition to Reach |
|---|---|---|
| 1 | 🌰 Seed | Habit created, 0 days completed |
| 2 | 🌱 Sprout | 1–3 days completed |
| 3 | 🪴 Sapling | 4–7 days, completion rate ≥ 70% |
| 4 | 🌿 Young Tree | 14-day streak, completion rate ≥ 75% |
| 5 | 🌳 Full Tree | 30-day streak, completion rate ≥ 80% |
| 6 | 🌲 Ancient Tree | 90-day streak, completion rate ≥ 85% |
| 7 | ✨ Glowing Tree | 180-day streak, completion rate ≥ 90% |

**Completion rate** = rolling 7-day average of (completed todos / total todos) for that habit.

### 8.3 Tree Growth Rules

Tree advances one stage when:
- Streak condition AND completion rate condition for the next stage are both met
- A level milestone is hit (visual only — leaves burst, no stage skip)

Tree growth animation triggers when:
- Todo completed that pushes stage condition over threshold
- Full set of todos completed in one day

### 8.4 Tree Shrink Rules

Tree loses one growth stage when:
- User misses that specific habit for **2 consecutive days**
- Completion rate for that habit drops below **50% for 3 consecutive days**
- Loses one stage per trigger (not all at once)
```
if (consecutiveMisses >= 2 || rollingRate3Day < 0.50) {
  tree.stage = Math.max(0, tree.stage - 1)
  triggerShrinkAnimation()
}
```

Tree does NOT shrink below stage 1 (Seed) — it becomes a "Ghost Tree."

### 8.5 Ghost Tree

When a tree would shrink below Seed:
- Tree becomes a **Ghost Tree** (bare, grey, no leaves)
- Ghost tree is never deleted — it remains in the garden as a dead tree
- Ghost tree can be revived: complete 3 consecutive days for that habit
- On revival: tree returns to Sprout (stage 2), +80 XP awarded
- Revival animation: leaves burst back, color returns
```
if (tree.stage === 0 && shrinkTrigger) {
  tree.state = 'ghost'
}
if (tree.state === 'ghost' && consecutiveCompletedDays >= 3) {
  tree.state = 'alive'
  tree.stage = 1
  xp += 80
  triggerRevivalAnimation()
}
```

### 8.6 Tree Health Status

Displayed as a visual indicator on the tree card:

| 7-Day Completion Rate | Status | Visual Effect |
|---|---|---|
| ≥ 85% | 🟢 Thriving | Subtle glow on tree |
| 70–84% | 🟡 Growing | Normal |
| 50–69% | 🟠 Struggling | Leaves yellowing |
| < 50% | 🔴 Wilting | Leaves falling, push notification |

### 8.7 Glowing Tree → Forest

When a tree reaches Stage 7 (Glowing Tree) AND a full todo set is completed:
- Tree is **permanently retired to the Forest**
- The habit tree resets to Stage 1 (Seed) — the user starts growing again
- The forest entry is permanent and never removed
- Forest tree displays the color palette and size from when it was retired
- User receives a forest notification and +100 XP bonus

> ⚠️ **Free Tier Restriction**: Forest view is locked for free users (see §18.3). Trees that reach Stage 7 are still retired and recorded server-side — they appear in the Forest once the user upgrades. This prevents data loss and creates a "you have trees waiting for you" upgrade hook.

---

## 9. Forest System

### 9.1 Forest Rules

- Forest is a **permanent record** of every tree the user has grown to Stage 7
- Trees are added in chronological order, left to right
- Each tree in the forest retains its visual style (color palette, size variant)
- Forest is never reset (even on app reinstall if account is synced)
- Trees are displayed at varying sizes for visual variety

### 9.2 Forest Milestones

| Trees in Forest | Reward |
|---|---|
| 1 | "First Bloom" badge |
| 5 | "Grove Keeper" badge + rare seed |
| 10 | "Forest Architect" badge + tree skin unlock |
| 25 | "Ancient Grove" badge + animated forest background |
| 50 | "Legend of the Forest" badge + permanent profile border |

### 9.3 Forest Display Rules

- Forest section is hidden until first tree is added (replaced by "Complete all todos to grow your first tree")
- Forest scrolls horizontally if trees exceed viewport
- Tree #N label shown below each tree
- Hovering/tapping a forest tree shows: habit name, date retired, days grown, streak at retirement

---

## 10. AI Agent — Todo Breakdown Rules

### 10.1 Breakdown Constraints

When user starts a habit or challenge, the AI agent must:
- Generate **3–5 todos maximum per day** (never more — overwhelm kills habits)
- Start easy on Day 1–3, ramp up on Day 4+ (progressive overload)
- Include exactly **1 reflection todo per 7 days** ("Write 2 lines about how this is changing you")
- Never schedule todos after the user's configured sleep time
- Never repeat the exact same todo text two days in a row

### 10.2 Recalibration Rule

Every 7 days, the AI agent automatically checks completion rate:
- Completion rate < 60%: Agent simplifies todos for the next 7 days
- Completion rate > 90% for 7 days: Agent increases difficulty for the next 7 days
- Agent notifies user of recalibration: "Your plan has been adjusted based on your performance."

### 10.3 AI Todo XP Bonus

AI-generated todos are worth +2 XP more than user-added todos (12 vs 10) to incentivize using the AI feature.

> ⚠️ **Free Tier Restriction**: AI agents are usage-gated for free users. See §18.4 for full agent monetization rules.

---

## 11. Completion Rate Tracking

### 11.1 Per-Habit Rate

Each habit tracks a rolling **7-day completion rate** independently:
```
rate7Day = sum(completedTodos[last7Days]) / sum(totalTodos[last7Days])
```

### 11.2 Global Rate

The dashboard shows a global rate across all active habits:
```
globalRate = sum(allCompletedTodos[last7Days]) / sum(allTotalTodos[last7Days])
```

### 11.3 Rate Thresholds and Actions

| Global Rate | System Action |
|---|---|
| ≥ 85% | No action. Tree glows. |
| 70–84% | No action. Normal state. |
| 50–69% | Push notification: "You're struggling. Want to simplify?" |
| < 50% for 3 days | Push notification: "Your trees are wilting. Tap to adjust." |
| < 30% for 5 days | AI agent auto-simplifies all habits |

---

## 12. Weekly Boss Challenge

### 12.1 Rules

- Every Sunday, a boss challenge appears in the app
- Boss challenge is 1 hard todo, generated by the AI, slightly beyond the user's current difficulty level
- User has until end of Sunday to complete it
- Completing it: +250 XP + 1 Shield
- Not completing it: No penalty (pure upside mechanic — failing costs nothing)

> ⚠️ **Free Tier Restriction**: Weekly Boss Challenge is a Pro-only feature. Free users see the challenge card but it is locked with a "Go Pro to unlock" prompt. This is intentional — it's a weekly visible reminder of what they're missing.

### 12.2 Boss Challenge Scaling

Boss challenge difficulty scales with user level:
- Level 1–3: Easy (e.g., "Complete your workout today")
- Level 4–6: Medium (e.g., "Log 3 hours of focused work")
- Level 7–9: Hard (e.g., "Complete every habit with 100% today")
- Level 10: Legendary (e.g., "Perfect day + help someone else build a habit")

---

## 13. Notification Rules

### 13.1 Reminder Notifications

- Each todo has a user-set reminder time (the deadline)
- App sends a push notification 30 minutes before each todo deadline
- If todo is still incomplete 5 minutes after deadline: second notification sent
- Maximum 3 reminder notifications per todo (30min before, at deadline, 5min after)

### 13.2 Streak Danger Notification

Sent at 8 PM local time if the user hasn't yet completed enough todos to count the day:

> "Your [X]-day streak is at risk. Complete [Y] more todo(s) to keep it alive. 🔥"

### 13.3 Shield Notification (see §7.5)

### 13.4 Tree Wilt Notification

Sent when tree drops a stage:

> "Your [Habit Name] tree lost a stage. 🍂 Complete 3 consecutive days to start recovering."

### 13.5 Forest Notification

Sent when tree is retired to forest:

> "Your [Habit Name] tree has joined your forest! 🌳 That's [N] trees grown. Start a new seed?"

### 13.6 Notification Caps

- Maximum **5 push notifications per day** per user across all habits
- User can configure quiet hours (no notifications between X PM and Y AM)
- No notifications during quiet hours except streak danger at 8 PM if 8 PM falls outside quiet hours

---

## 14. Anti-Gaming Rules

### 14.1 Todo Completion Validation

- A todo can only be marked complete if the current time is within 24 hours of its creation
- Backdating completions is not allowed (server-side timestamp validation)
- Rapid-fire completions (more than 1 per 10 seconds) trigger a soft lock with a CAPTCHA-style confirm

### 14.2 Streak Integrity

- Streak is calculated server-side at midnight in the user's timezone
- Client cannot modify streak count — all streak logic runs on the server
- If timezone changes mid-streak, streak is preserved but recalculated from new timezone forward

### 14.3 XP Integrity

- All XP changes (earn and deduct) are logged with timestamp, action type, and delta
- XP log is append-only — no edits or deletes allowed
- Current XP = sum of all XP log entries (recalculated on load if discrepancy detected)

---

## 15. Edge Cases

| Scenario | Rule |
|---|---|
| User has 0 todos for a day | Day is neutral — streak neither advances nor breaks |
| User deletes a habit mid-streak | Streak for that habit ends. Global streak unaffected. |
| App offline when deadline passes | Sync on reconnect. If within 1 hour of deadline, grace given. |
| User changes timezone | Streak preserved. Day boundary recalculates from new TZ going forward. |
| Two todos due same minute | Both treated independently. Early completion bonus applies to each. |
| Shield used but user had 0 XP | Shield still works. XP stays at 0 (floor rule). |
| All habits deleted | Forest persists. XP persists. Level persists. |
| User attempts to complete a ghost tree's todos | Todos still function normally — ghost tree revival tracks completions. |
| Free user pays ₹9 to restore streak | Payment processed via Razorpay. On success, shield consumed, streak restored, −30 XP applied. |
| Free user upgrades mid-streak-break | Subscription activates immediately. Shield is used, streak restored, user enters Pro state. |
| Free user hits agent usage limit | All agent entry points lock. User sees paywall. Existing AI-generated todos remain functional. |
| Free user retires a tree to forest | Tree is recorded server-side. Forest page remains locked. Badge shown on Pro upgrade paywall: "You have [N] trees waiting in your forest." |

---

## 16. Data Model Summary
```typescript
// Core entities

User {
  id: string
  totalXP: number          // lifetime cumulative, never decreases below 0
  level: number            // 1–10, never regresses
  streak: number           // current active streak days
  longestStreak: number    // all-time record
  shields: number          // 0–3
  graceLastUsed: Date | null
  forestTrees: ForestTree[]
  xpLog: XPLogEntry[]
  plan: 'free' | 'pro'                    // subscription tier
  planExpiresAt: Date | null              // null = free forever
  agentUsageCount: number                 // lifetime agent invocations (free users only)
  agentsPurchased: AgentPurchase[]        // per-agent purchases (free users)
  streakRestoreCount: number              // lifetime ₹9 streak restores used
}

Habit {
  id: string
  userId: string
  name: string
  createdAt: Date
  tree: Tree
  completionRate7Day: number  // 0.0 to 1.0
  consecutiveMisses: number
  isGhost: boolean
}

Todo {
  id: string
  habitId: string
  text: string
  deadline: Date
  isAIGenerated: boolean
  completedAt: Date | null
  xpAwarded: number | null
}

Tree {
  habitId: string
  stage: 0 | 1 | 2 | 3 | 4 | 5 | 6  // 0 = ghost
  state: 'alive' | 'ghost'
  retiredToForest: boolean
  retiredAt: Date | null
}

ForestTree {
  id: string
  userId: string
  habitId: string
  habitName: string
  retiredAt: Date
  streakAtRetirement: number
  daysGrownTotal: number
  paletteSeed: number       // used to generate consistent visual
}

XPLogEntry {
  id: string
  userId: string
  delta: number             // positive = earn, negative = deduct
  reason: XPReason
  timestamp: Date
}

AgentPurchase {
  id: string
  userId: string
  agentId: string           // which agent was purchased
  purchasedAt: Date
  expiresAt: Date           // 30 days from purchase
  amountPaid: number        // 4900 paise = ₹49
}

StreakRestoreTransaction {
  id: string
  userId: string
  streakBefore: number
  streakAfter: number       // same value — restored
  shieldConsumed: boolean
  amountPaid: number        // 900 paise = ₹9
  timestamp: Date
  razorpayOrderId: string
}

enum XPReason {
  TODO_COMPLETE, EARLY_BONUS, MOMENTUM_BONUS, PERFECT_DAY,
  STREAK_MILESTONE, LEVEL_MILESTONE, BOSS_CHALLENGE,
  GHOST_REVIVED, LOGIN_BONUS, REFLECTION_BONUS,
  MISS_PENALTY, STREAK_BREAK, SHIELD_COST, INACTIVITY_DECAY
}

enum AgentId {
  HABIT_BREAKDOWN,      // generates daily todos from a habit goal
  REFLECTION_COACH,     // weekly reflection and insight summaries
  DIFFICULTY_TUNER,     // adjusts plan based on performance
  CODING_INSIGHTS,      // PRO ONLY — locked forever for free users
  GOAL_PLANNER,         // PRO ONLY — locked forever for free users
  BOSS_CHALLENGE_GEN    // PRO ONLY — locked forever for free users
}
```

---

## 17. Monetization System

### 17.1 Subscription Tiers

| Plan | Price | Billing |
|---|---|---|
| Free | ₹0 | — |
| Pro | ₹149/month | Monthly via Razorpay |
| Pro Annual | ₹999/year | Annual via Razorpay (~44% savings) |

All payments are processed through **Razorpay** for Indian users. International users pay via **Stripe** at equivalent USD pricing ($2.49/month, $14.99/year).

### 17.2 Streak Restore — Micro-Payment (Free Users)

When a free user's streak breaks AND they have ≥ 1 shield:

- User is shown a **Streak Restore Gate** (modal, cannot be dismissed without choosing)
- Options:
  - **"Restore with Shield — ₹9"**: One-time Razorpay payment. On success: shield consumed, streak restored, −30 XP applied, `streakRestoreCount` incremented.
  - **"Go Pro — ₹149/mo"**: Opens Pro subscription flow. On success: streak restored immediately as part of onboarding, shield consumed.
  - **"Let it break"**: Dismisses modal. Streak resets, −50 XP applied, shield NOT consumed (it remains for future use).

> Design note: "Let it break" must be clearly available — dark patterns erode trust. The option should be present but visually de-emphasised (small grey text link, not a button).

```
// Streak restore payment flow
async function handleStreakRestorePayment(userId: string) {
  const order = await razorpay.orders.create({ amount: 900, currency: 'INR' })
  // ... payment UI
  // On success:
  user.shields -= 1
  user.xp = Math.max(0, user.xp - 30)
  // streak preserved, not reset
  user.streakRestoreCount += 1
  logTransaction(StreakRestoreTransaction)
}
```

### 17.3 Per-Agent Purchase (Free Users)

Free users can purchase individual agents at **₹49/agent/month**.

- Purchase unlocks that agent for 30 days from purchase date
- After 30 days, agent locks again — user must repurchase or upgrade to Pro
- Pro plan includes ALL current and future agents with no per-agent charges

| Agent | Free | Per-Agent (₹49/mo) | Pro |
|---|---|---|---|
| Habit Breakdown | 5 uses then locked | ✅ Unlocks full access | ✅ Unlimited |
| Reflection Coach | 5 uses then locked | ✅ Unlocks full access | ✅ Unlimited |
| Difficulty Tuner | 5 uses then locked | ✅ Unlocks full access | ✅ Unlimited |
| Coding Insights | ❌ Permanently locked | ❌ Not available | ✅ Unlimited |
| Goal Planner | ❌ Permanently locked | ❌ Not available | ✅ Unlimited |
| Boss Challenge Gen | ❌ Permanently locked | ❌ Not available | ✅ Unlimited |

> Rationale for 5 uses (not 3): 3 uses is too few for a user to see real value. 5 uses means they experience at least one full week of AI-generated todos — enough to form a habit around the feature and feel the loss when it locks.

```
// Agent usage gate
function canUseAgent(user: User, agentId: AgentId): boolean {
  if (user.plan === 'pro') return true

  // Permanently locked agents
  if (['CODING_INSIGHTS', 'GOAL_PLANNER', 'BOSS_CHALLENGE_GEN'].includes(agentId)) {
    return false
  }

  // Check per-agent purchase
  const purchase = user.agentsPurchased.find(
    p => p.agentId === agentId && p.expiresAt > new Date()
  )
  if (purchase) return true

  // Free usage allowance
  return user.agentUsageCount < 5
}

function recordAgentUsage(user: User, agentId: AgentId) {
  if (user.plan === 'free' && !hasActivePurchase(user, agentId)) {
    user.agentUsageCount += 1
  }
}
```

### 17.4 Feature Lock Table — Free vs Pro

| Feature | Free | Pro |
|---|---|---|
| Habit tracking (core) | ✅ Unlimited | ✅ Unlimited |
| Todo management | ✅ Unlimited | ✅ Unlimited |
| XP & level system | ✅ Full | ✅ Full |
| Tree growth (garden) | ✅ Full | ✅ Full |
| Streak tracking | ✅ Full | ✅ Full |
| Streak shields | ⚠️ Earned but pay-to-use (₹9) | ✅ Free to use |
| AI agents (basic 3) | ⚠️ 5 uses total, then ₹49/agent/mo | ✅ Unlimited |
| AI agents (Pro-only 3) | ❌ Permanently locked | ✅ Unlimited |
| Forest view | ❌ Locked (trees still recorded) | ✅ Full |
| Weekly Boss Challenge | ❌ Locked | ✅ Full |
| XP multiplier (Level 8+) | ❌ Disabled (visible but inactive) | ✅ Active |
| Coding Insights page | ❌ Permanently locked | ✅ Full |
| Goal Planner page | ❌ Permanently locked | ✅ Full |
| Custom tree skins | ❌ Locked | ✅ Full |
| Animated tree skins | ❌ Locked | ✅ Full |
| Notification customisation | ⚠️ Basic only | ✅ Full (quiet hours, per-habit) |
| Data export | ❌ Locked | ✅ CSV + JSON export |
| Priority support | ❌ | ✅ |

### 17.5 Upgrade Prompt Strategy

Upgrade prompts appear contextually — never as random popups:

| Trigger | Prompt Copy |
|---|---|
| Streak breaks, shield available | "Use your shield for ₹9 or go Pro to use shields free forever." |
| Agent usage limit hit (5th use) | "You've used your 5 free AI sessions. Keep your momentum going — ₹49/month for this agent, or ₹149 for everything." |
| User tries to open Forest | "You have [N] trees waiting in your forest. Go Pro to see them." |
| User tries Boss Challenge | "Boss Challenges unlock at Pro. +250 XP + shields every Sunday." |
| Level 8 reached, multiplier inactive | "You hit Level 8! Your XP multiplier is active for Pro users. Upgrade to start earning 1.1x XP." |
| User exports data (blocked) | "Export your habit data — available on Pro." |

> All prompts must have a clear **dismiss option**. No forced paywalls except the streak restore gate (which still has "Let it break").

### 17.6 Payment Infrastructure

```typescript
// Payment config
const PRICES = {
  STREAK_RESTORE: 900,          // ₹9 in paise
  AGENT_MONTHLY: 4900,          // ₹49 in paise
  PRO_MONTHLY: 14900,           // ₹149 in paise
  PRO_ANNUAL: 99900,            // ₹999 in paise
}

// Razorpay for India (default)
// Stripe for international users
// Detect via: user IP / phone country code at signup

function getPaymentProvider(user: User): 'razorpay' | 'stripe' {
  return user.country === 'IN' ? 'razorpay' : 'stripe'
}
```

---

## 18. Edge Cases — Monetization

| Scenario | Rule |
|---|---|
| Free user has 3 shields, streak breaks | All 3 shields visible in inventory. Pay ₹9 to use one, or go Pro. |
| Free user paid ₹9 restore but has 0 shields | Cannot restore — no shield to consume. Only option is Pro. Show "You have no shields. Go Pro to earn and use shields." |
| Free user's ₹49 agent purchase expires mid-habit | Agent locks at expiry. Existing AI-generated todos remain functional. New generation blocked. |
| Pro user cancels subscription | Reverts to free tier at end of billing period. Shields remain in inventory but become pay-to-use. Forest view locks (data preserved). |
| User has pending forest trees at plan downgrade | Trees remain recorded server-side. Forest locks. Upgrade hook shown. |
| Free user reaches Level 8 | XP multiplier shown as "🔒 Pro" in the level perk UI. No bonus XP applied. |
| Agent usage count is shared across all 3 basic agents | Yes — 5 uses total, not 5 per agent. This creates urgency and drives per-agent or Pro purchase. |

---

## 19. Version
```
RULES version: 1.1.0
Last updated: 2025
App: UFL — Habit Tracker
Author: Abhishek
Status: Canonical — all game logic must implement this spec exactly
Changelog:
  v1.1.0 — Added §17 Monetization System, §18 Monetization Edge Cases,
            updated §7.4-7.5 (shield pay-gate for free users),
            updated §12 (Boss Challenge Pro lock),
            updated §8.7 (Forest lock for free users),
            updated §10 (Agent usage gate reference),
            updated §5 (XP multiplier Pro restriction),
            updated §16 data model (plan, agentUsageCount, AgentPurchase, etc.)
```