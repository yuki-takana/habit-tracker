# Habit Tracker — Game Design Rule System v1.0
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

### 7.4 Shield Notification Copy

> "Your shield blocked tonight's miss. Streak protected. −30 XP. 🛡️ [X] shields remaining."

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

### 13.3 Shield Notification (see §7.4)

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

enum XPReason {
  TODO_COMPLETE, EARLY_BONUS, MOMENTUM_BONUS, PERFECT_DAY,
  STREAK_MILESTONE, LEVEL_MILESTONE, BOSS_CHALLENGE,
  GHOST_REVIVED, LOGIN_BONUS, REFLECTION_BONUS,
  MISS_PENALTY, STREAK_BREAK, SHIELD_COST, INACTIVITY_DECAY
}
```

---

## 17. Version
```
RULES version: 1.0.0
Last updated: 2025
App: Habit Tracker (working title)
Author: Abhishek
Status: Canonical — all game logic must implement this spec exactly
```