'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendWhatsAppReminder, getWhatsAppProvider, sendMetaTextMessage, sendUserAnalytics } from '@/services/whatsapp';
import bcrypt from 'bcryptjs';

export async function saveUserPhone(phoneNumber: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      phone: phoneNumber,
      whatsappEnabled: true,
    },
  });

  try {
    // Send a welcome message upon setting up the number
    await sendMetaTextMessage(
      phoneNumber,
      "Welcome to UFL the real tracking system! 👋\n\nI'll be sending you reminders for your tasks here. Reply with '1' or 'Done' when you complete a task!"
    );
  } catch (error) {
    console.error("Failed to send WhatsApp welcome message:", error);
  }

  return updatedUser;
}

export async function saveUserApiKeys(data: {
  wakatimeApiKey?: string;
  githubApiKey?: string;
  linkedinApiKey?: string;
  twitterApiKey?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  return await prisma.user.update({
    where: { email: session.user.email },
    data: {
      wakatimeApiKey: data.wakatimeApiKey,
      githubApiKey: data.githubApiKey,
      linkedinApiKey: data.linkedinApiKey,
      twitterApiKey: data.twitterApiKey,
    },
  });
}

export async function updateUserProfile(data: {
  name?: string;
  email?: string,
  currentPassword?: string;
  newPassword?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) throw new Error("User not found");

  let updateData: any = {};

  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;

  if (data.newPassword) {
    if (data.newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // If user already has password → validate current password
    if (user.password) {
      if (!data.currentPassword) {
        throw new Error("Current password required");
      }

      const isValid = await bcrypt.compare(
        data.currentPassword,
        user.password
      );

      if (!isValid) {
        throw new Error("Invalid current password");
      }
    }
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    updateData.password = hashedPassword;
  }

  return await prisma.user.update({
    where: { email: session.user.email },
    data: updateData,
  });
}

export async function toggleWhatsapp(enabled: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  return await prisma.user.update({
    where: { email: session.user.email },
    data: {
      whatsappEnabled: enabled,
    },
  });
}

export async function sendTestWhatsapp() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { phone: true, name: true },
  });

  if (!user?.phone) throw new Error("Phone number not set");
  const provider = await getWhatsAppProvider();
  // await sendUserAnalytics(
  //   user.phone,
  //   "Abhishek",
  //   3,
  //   "85%"
  // );
  await sendWhatsAppReminder(user.phone,"Abhishek", "Test Message from Habit Tracker!", provider);
  // await sendMetaTextMessage(user.phone, "hello this is test message from UFL!")

  return { success: true };
}

export async function getGlobalWhatsappStatus() {
  const config = await prisma.systemConfig.findUnique({
    where: { key: 'whatsapp_global_enabled' }
  });
  return config ? config.value === 'true' : true; // Default to true
}

export async function toggleGlobalWhatsapp(enabled: boolean) {
  const session = await getServerSession(authOptions);
  const adminEmail = "abhisheaurya@gmail.com";

  if (session?.user?.email !== adminEmail) {
    throw new Error("Unauthorized: Only admin can toggle global settings");
  }

  return await prisma.systemConfig.upsert({
    where: { key: 'whatsapp_global_enabled' },
    update: { value: String(enabled) },
    create: { key: 'whatsapp_global_enabled', value: String(enabled) }
  });
}

import { DEFAULT_SUBSCRIPTION_CONFIG } from '@/lib/constants';

export async function getSubscriptionConfig() {
  const keys = Object.keys(DEFAULT_SUBSCRIPTION_CONFIG);
  const configs = await prisma.systemConfig.findMany({
    where: { key: { in: keys } }
  });

  const result = { ...DEFAULT_SUBSCRIPTION_CONFIG };
  configs.forEach(c => {
    if (c.key in result) {
      result[c.key as keyof typeof DEFAULT_SUBSCRIPTION_CONFIG] = c.value;
    }
  });

  return result;
}

export async function updateSubscriptionConfig(data: typeof DEFAULT_SUBSCRIPTION_CONFIG) {
  const session = await getServerSession(authOptions);
  const adminEmail = "abhisheaurya@gmail.com";

  if (session?.user?.email !== adminEmail) {
    throw new Error("Unauthorized: Only admin can update global settings");
  }

  const updates = Object.entries(data).map(([key, value]) => {
    return prisma.systemConfig.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) }
    });
  });

  await prisma.$transaction(updates);
  return true;
}

export async function fetchUserSubscriptionTier() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { plan: 'free' };
  const { getSubscriptionLimits } = await import('@/lib/subscription');
  const limits = await getSubscriptionLimits(session.user.id);
  return { plan: limits.isPro ? 'pro' : 'free', periodEnd: limits.periodEnd };
}

export async function getAdminDashboardStats() {
  const session = await getServerSession(authOptions);
  const adminEmail = "abhisheaurya@gmail.com";

  if (session?.user?.email !== adminEmail) {
    throw new Error("Unauthorized");
  }

  // Basic counters
  const totalUsers = await prisma.user.count();

  // A "Pro" user in our system has an 'active' or 'trialing' subscription
  const proUsers = await prisma.subscription.count({
    where: {
      status: { in: ['active', 'trialing'] }
    }
  });

  const freeUsers = totalUsers - proUsers;

  // Chart data: Users joined in the last 30 days grouped by date
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Note: MongoDB/Prisma direct date grouping requires raw query or manual aggregation. 
  // We will fetch recent users and group them manually in JS to be safe and cross-DB compatible.
  const recentUsers = await prisma.user.findMany({
    where: {
      // Only count objects created after 30 days ago.
      // Because MongoDB stores ObjectIds which encode timestamps, we ideally just filter by it, 
      // but assuming `createdAt` is explicitly available or we fetch all recent and group:
      // If User doesn't have createdAt, we can approximate using id timestamp for Mongo, 
      // but typically `emailVerified` or related tables have it. 
      // Since User model doesn't have an explicit createdAt, we fetch all users and filter by ObjectId timestamp.
    },
    select: { id: true, email: true }
  });

  // Since prisma string ObjectIds contain timestamps (first 8 chars in hex):
  const groupedData: Record<string, { date: string; free: number; paid: number }> = {};

  // Initialize last 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    groupedData[dateStr] = { date: dateStr, free: 0, paid: 0 };
  }

  // We need to know who is paid. Let's fetch active subscriptions to correlate
  const activeSubs = await prisma.subscription.findMany({
    where: { status: { in: ['active', 'trialing'] } },
    select: { userId: true }
  });
  const paidUserIds = new Set(activeSubs.map(s => s.userId));

  recentUsers.forEach(user => {
    // Extract timestamp from mongo ObjectId:
    const timestamp = parseInt(user.id.substring(0, 8), 16) * 1000;
    const userDate = new Date(timestamp);

    if (userDate >= thirtyDaysAgo) {
      const dateStr = userDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (groupedData[dateStr]) {
        if (paidUserIds.has(user.id)) {
          groupedData[dateStr].paid += 1;
        } else {
          groupedData[dateStr].free += 1;
        }
      }
    }
  });

  const chartData = Object.values(groupedData);

  return {
    totalUsers,
    proUsers,
    freeUsers,
    chartData
  };
}

export async function getUserXp() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { xp: 0, level: 1 };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { xp: true, level: true }
  });

  return { xp: user?.xp || 0, level: user?.level || 1 };
}

export async function getGamificationConfig() {
  const config = await prisma.systemConfig.findUnique({ where: { key: 'xp_level_thresholds' } });
  if (config?.value) {
    try {
      return JSON.parse(config.value);
    } catch { }
  }
  return null;
}

export async function updateGamificationConfig(thresholds: any[]) {
  const session = await getServerSession(authOptions);
  const adminEmail = "abhisheaurya@gmail.com";

  if (session?.user?.email !== adminEmail) {
    throw new Error("Unauthorized: Only admin can update gamification settings");
  }

  await prisma.systemConfig.upsert({
    where: { key: 'xp_level_thresholds' },
    update: { value: JSON.stringify(thresholds) },
    create: { key: 'xp_level_thresholds', value: JSON.stringify(thresholds) }
  });

  return true;
}
