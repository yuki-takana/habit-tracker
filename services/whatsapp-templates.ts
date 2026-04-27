
import axios from 'axios';

const META_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WA_TOKEN;
const META_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WA_PHONE_NUMBER_ID;
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com';

async function sendMetaTemplate(
  to: string,
  templateName: string,
  components: object[]
) {
  const formattedPhone = to.replace(/\D/g, '');

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${META_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${META_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ [Template: ${templateName}] Sent to ${formattedPhone}`);
    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
      data: response.data,
    };
  } catch (error: any) {
    console.error(`❌ [Template: ${templateName}] Failed for ${formattedPhone}`);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    throw new Error(error.response?.data?.error?.message || `Failed to send template: ${templateName}`);
  }
}

export async function sendMetaFreeText(to: string, text: string) {
  const formattedPhone = to.replace(/\D/g, '');

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${META_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: { body: text, preview_url: false },
      },
      {
        headers: {
          Authorization: `Bearer ${META_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ [FreeText] Sent to ${formattedPhone}`);
    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
      data: response.data,
    };
  } catch (error: any) {
    console.error(`❌ [FreeText] Failed for ${formattedPhone}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to send free-form message');
  }
}
export async function sendMorningBriefingTemplate(
  to: string,
  userName: string,
  missedYesterday: string,
  todayTopTasks: string,
  appLink: string = `${APP_BASE_URL}/daily-goals`
) {
  return sendMetaTemplate(to, 'morning_briefing', [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: userName },
        { type: 'text', text: missedYesterday },
        { type: 'text', text: todayTopTasks },
        { type: 'text', text: appLink },
      ],
    },
  ]);
}

export async function sendTodoStartReminderTemplate(
  to: string,
  userName: string,
  taskName: string,
  estimatedMins: string,
  todoId: string
) {
  return sendMetaTemplate(to, 'todo_start_reminder', [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: userName },
        { type: 'text', text: taskName },
        { type: 'text', text: estimatedMins },
      ],
    },
    // Button 0: Start
    {
      type: 'button',
      sub_type: 'quick_reply',
      index: '0',
      parameters: [{ type: 'payload', payload: `START_${todoId}` }],
    },
    // Button 1: Snooze 15 min
    {
      type: 'button',
      sub_type: 'quick_reply',
      index: '1',
      parameters: [{ type: 'payload', payload: `SNOOZE15_${todoId}` }],
    },
    // Button 2: Snooze 30 min
    {
      type: 'button',
      sub_type: 'quick_reply',
      index: '2',
      parameters: [{ type: 'payload', payload: `SNOOZE30_${todoId}` }],
    },
  ]);
}

export async function sendDeadlineAlertTemplate(
  to: string,
  userName: string,
  taskName: string,
  minutesLeft: string,
  todoId: string
) {
  return sendMetaTemplate(to, 'todo_deadline_alert', [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: userName },
        { type: 'text', text: taskName },
        { type: 'text', text: minutesLeft },
      ],
    },
    // Button 0: Mark Done
    {
      type: 'button',
      sub_type: 'quick_reply',
      index: '0',
      parameters: [{ type: 'payload', payload: `DONE_${todoId}` }],
    },
    // Button 1: Mark Failed
    {
      type: 'button',
      sub_type: 'quick_reply',
      index: '1',
      parameters: [{ type: 'payload', payload: `FAIL_${todoId}` }],
    },
  ]);
}

export function getMotivationalLine(completionRate: number): string {
  if (completionRate >= 100) {
    return `🏆 Perfect day! You crushed every task. Absolutely elite. Keep this energy tomorrow!`;
  } else if (completionRate >= 80) {
    return `🔥 Almost perfect! You showed up strong today. Tomorrow, close that gap!`;
  } else if (completionRate >= 60) {
    return `💪 Solid effort. 60%+ means your streak is safe. Push for more tomorrow!`;
  } else if (completionRate >= 40) {
    return `⚡ Tough day? That's okay. Tomorrow is a fresh start — plan better, execute harder.`;
  } else {
    return `🌱 Every master was once a beginner. Tomorrow, pick ONE task and crush it first.`;
  }
}

export async function sendMidnightSummaryTemplate(
  to: string,
  userName: string,
  completedCount: number,
  missedCount: number,
  completionRate: number,
  streakStatus: string,
  xpToday: string,
  appLink: string = `${APP_BASE_URL}/insights`
) {
  const motivationalLine = getMotivationalLine(completionRate);

  return sendMetaTemplate(to, 'midnight_summary', [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: userName },
        { type: 'text', text: String(completedCount) },
        { type: 'text', text: String(missedCount) },
        { type: 'text', text: `${completionRate}%` },
        { type: 'text', text: streakStatus },
        { type: 'text', text: xpToday },
        { type: 'text', text: motivationalLine },
        { type: 'text', text: appLink },
      ],
    },
  ]);
}

export async function sendPhoneConfirmedTemplate(
  to: string,
  userName: string,
  appLink: string = `${APP_BASE_URL}/todos`
) {
  return sendMetaTemplate(to, 'phone_number_confirmed', [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: userName },
        { type: 'text', text: appLink },
      ],
    },
  ]);
}

export async function sendTestWhatsAppTemplate(
  to: string,
  userName: string,
  appLink: string = `${APP_BASE_URL}/settings`
) {
  return sendMetaTemplate(to, 'whatsapp_test_message', [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: userName },
        { type: 'text', text: appLink },
      ],
    },
  ]);
}

export async function sendTaskStartedReply(
  to: string,
  userName: string,
  taskName: string
) {
  const text = `🚀 *${taskName}* is now in progress!\n\nGo get it, ${userName}! I'll check in when the deadline approaches. 💪`;
  return sendMetaFreeText(to, text);
}

/** Sent when user taps "✅ Mark Done" on a deadline alert */
export async function sendTaskCompletedReply(
  to: string,
  userName: string,
  taskName: string,
  xpEarned: number
) {
  const text = `🎉 *${taskName}* marked complete!\n\n+${xpEarned} XP earned, ${userName}! You're on a roll. Keep it up! 🔥`;
  return sendMetaFreeText(to, text);
}

/** Sent when user taps "❌ Mark Failed" on a deadline alert */
export async function sendTaskFailedReply(
  to: string,
  userName: string,
  taskName: string
) {
  const text = `That's okay, ${userName}. *${taskName}* has been marked as missed.\n\n💡 Tomorrow is a fresh start. You've got this.`;
  return sendMetaFreeText(to, text);
}

/** Sent when user taps "⏳ Snooze 15 min" or "⏳ Snooze 30 min" */
export async function sendSnoozeConfirmationReply(
  to: string,
  taskName: string,
  snoozeMins: number
) {
  const text = `⏳ Got it! I'll remind you about *${taskName}* in ${snoozeMins} minutes.`;
  return sendMetaFreeText(to, text);
}

/** Fallback reply for unknown messages from user */
export async function sendUnknownMessageReply(to: string, userName: string) {
  const text = `👋 Hi ${userName}! I'm your Habit Tracker assistant.\n\nUse the app to manage your tasks, or tap buttons in my messages to update task status.\n\n🔗 Open app: ${APP_BASE_URL}/todos`;
  return sendMetaFreeText(to, text);
}
