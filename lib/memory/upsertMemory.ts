import { prisma } from "@/lib/prisma";

type MemoryInput = {
  userId: string;
  domain: string;
  memoryType: "preference" | "pattern" | "fact" | "summary" | "blocker";
  key: string;
  value: unknown;
  source: "user_stated" | "agent_inferred" | "pattern_detected";
  confidence?: number;
};

/**
 * Upserts a typed fact/pattern into UserMemory.
 * If the key already exists for this user+domain, updates it and refreshes lastReinforced.
 * Otherwise creates a new entry.
 */
export async function upsertMemory(input: MemoryInput) {
  const { userId, domain, key, value, memoryType, source, confidence = 1.0 } = input;

  return prisma.userMemory.upsert({
    where: { userId_domain_key: { userId, domain, key } },
    update: {
      value: value as any,
      confidence,
      source,
      lastReinforced: new Date(),
      updatedAt: new Date(),
    },
    create: {
      userId,
      domain,
      memoryType,
      key,
      value: value as any,
      confidence,
      source,
    },
  });
}
