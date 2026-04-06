import { prisma } from '@/lib/prisma'; // Ensure prisma is imported if not globally passed

// Default fallback Absolute XP Level System (Rule 06)
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 150 },
  { level: 3, xp: 400 },
  { level: 4, xp: 800 },
  { level: 5, xp: 1400 },
  { level: 6, xp: 2200 },
  { level: 7, xp: 3400 },
  { level: 8, xp: 5000 },
  { level: 9, xp: 7200 },
  { level: 10, xp: 10000 },
];

export async function getLevelThresholds(prismaInstance: any = prisma) {
  try {
    const config = await prismaInstance.systemConfig.findUnique({
      where: { key: 'xp_level_thresholds' }
    });
    if (config?.value) return JSON.parse(config.value);
  } catch (err) {
    console.error("Failed to parse xp_level_thresholds from config", err);
  }
  return LEVEL_THRESHOLDS;
}

export function getLevelForXp(xp: number, thresholds: any[] = LEVEL_THRESHOLDS): number {
  let matchedLevel = 1;
  for (const threshold of thresholds) {
    if (xp >= threshold.xp) {
      matchedLevel = threshold.level;
    } else {
      break;
    }
  }
  return matchedLevel;
}

// Rule 04: Base XP calculation per todo
export function calculateTodoXP(params: {
  isAIGenerated: boolean;
  isEarly: boolean; // >= 2 hours before deadline
  isFirstOfDay: boolean;
  userLevel: number;
}): number {
  let xp = params.isAIGenerated ? 12 : 10;
  if (params.isEarly) xp += 5;
  if (params.isFirstOfDay) xp += 5;

  // Level multipliers for EARNED xp
  if (params.userLevel >= 10) {
    xp *= 1.25;
  } else if (params.userLevel >= 8) {
    xp *= 1.1;
  }

  return Math.floor(xp);
}

// Rule 03: Floor rule and Level protection
export async function addXpToUser(prisma: any, userId: string, xpDelta: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, streakShields: true }
  });

  if (!user) return null;

  // Floor rule: XP can never go below 0
  let newXp = Math.max(0, user.xp + xpDelta);
  
  const thresholds = await getLevelThresholds(prisma);

  // Levels never regress
  let newLevel = user.level;
  const calcLevel = getLevelForXp(newXp, thresholds);
  
  if (calcLevel > newLevel) {
    newLevel = calcLevel;
  }

  let leveledUp = newLevel > user.level;
  let extraUpdates: any = {};

  // Rule 08: Earning shields at level 3, 5, 9
  // Max 3 shields held at any time.
  if (leveledUp) {
    let earnedShields = 0;
    for (let l = user.level + 1; l <= newLevel; l++) {
      if ([3, 5, 9].includes(l)) {
        earnedShields++;
      }
    }
    if (earnedShields > 0) {
      extraUpdates.streakShields = Math.min(3, user.streakShields + earnedShields);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: newLevel,
      ...extraUpdates
    }
  });

  return {
    updatedUser,
    leveledUp,
    xpDelta,
    currentLevel: newLevel
  };
}