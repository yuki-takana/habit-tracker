import twilio from 'twilio';
import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SUBSCRIPTION_CONFIG } from '@/lib/constants';
import dotenv from 'dotenv';
dotenv.config();

// Meta WhatsApp Cloud API config
const META_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WA_TOKEN;
const META_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WA_PHONE_NUMBER_ID;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_WHATSAPP_FROM;

const client = twilio(accountSid, authToken);

export async function getWhatsAppProvider(): Promise<'meta' | 'twilio' | 'local'> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'whatsapp_provider' }
    });
    return (config?.value as any) || DEFAULT_SUBSCRIPTION_CONFIG.whatsapp_provider as any || 'twilio';
  } catch (error) {
    return 'twilio';
  }
}


export async function sendWhatsAppReminderTwilio(to: string, taskName: string) {
  try {
    const message = await client.messages.create({
      body: `⏰ Habit Reminder: Don't forget to "${taskName}" today!`,
      from: fromPhone,
      to: `whatsapp:${to}` // Twilio requires the 'whatsapp:' prefix
    });

    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('WhatsApp Error:', error);
    throw new Error('Failed to send WhatsApp reminder');
  }
}

/**
 * Send a plain text message via Meta WhatsApp Cloud API.
 * Used for replies from webhook and general text messages.
 */
export async function sendMetaTextMessage(to: string, message: string) {
  const formattedPhone = to.replace('+', '');

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${META_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: { body: message }
      },
      { headers: { Authorization: `Bearer ${META_TOKEN}` } }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Meta Text Message Error:', error.response?.data || error.message);
    throw new Error('Failed to send Meta WhatsApp text message');
  }
}

export async function sendWhatsAppReminder(to: string, userName: string, taskName: string, provider: 'meta' | 'twilio' | 'local' = 'meta') {

  if (provider === 'meta') {
    const todoId = "69ab2957db047c4a38894c8d"
    try {
      // Meta requires a specific format: 91XXXXXXXXXX (no +)
      const formattedPhone = to.replace('+', '');
      const response = await axios.post(
        `https://graph.facebook.com/v21.0/${META_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: 'habit_reminder',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: userName },
                  { type: 'text', text: taskName }
                ]
              }
            ]
          }
        },
        { headers: { Authorization: `Bearer ${META_TOKEN}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Meta API failed, falling back to Twilio...', error);
      // Optional: Automatic fallback to Twilio if Meta fails
      return sendTwilioMessage(to, taskName);
    }
  } else {
    return sendTwilioMessage(to, taskName);
  }
}
export async function sendUserAnalytics(
  to: string,
  userName: string,
  taskCount: number,
  completionRate: string
) {
  const formattedPhone = to.replace(/\D/g, '');

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${META_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: 'daily_summary_ufl',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: userName },
                { type: 'text', text: String(taskCount) },
                { type: 'text', text: completionRate }
              ]
            },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [
                { type: 'text', text: "dashboard" }
              ]
            }
          ]
        }
      },
      { headers: { Authorization: `Bearer ${META_TOKEN}` } }
    );

    console.log("✅ Analytics Sent:", response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Meta Analytics Error:', error.response?.data || error.message);
    throw error;
  }
}

async function sendTwilioMessage(to: string, taskName: string) {
  return client.messages.create({
    body: `⏰ Habit Reminder: ${taskName}`,
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${to.startsWith('+') ? to : '+' + to}`
  });
}

export async function sendInteractiveWhatsAppReminder(
  to: string,
  taskName: string,
  userName: string,
  todoId: string,
  provider: 'meta' | 'twilio' | 'local' = 'meta'
) {
  const formattedPhone = to.replace('+', '');
  const messageText = `Hey ${userName}! 👋\n\n⏰ "${taskName}" starts in a few minutes.\n\nAre you ready to begin?`;

  if (provider === 'meta') {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v21.0/${META_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: messageText
            },
            action: {
              buttons: [
                {
                  type: 'reply',
                  reply: {
                    id: `START_${todoId}`,
                    title: '▶️ Start'
                  }
                },
                {
                  type: 'reply',
                  reply: {
                    id: `15MIN_${todoId}`,
                    title: '⏳ 15 min'
                  }
                },
                {
                  type: 'reply',
                  reply: {
                    id: `30MIN_${todoId}`,
                    title: '⏳ 30 min'
                  }
                }
              ]
            }
          }
        },
        { headers: { Authorization: `Bearer ${META_TOKEN}` } }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Meta Interactive Error:', error.response?.data || error.message);
      return sendWhatsAppReminder(to, `${messageText}\n\nReply with "start" to begin, or "15" / "30" to delay.`, 'meta');
    }
  } else if (provider === 'twilio') {
    // Twilio implementation - Twilio also supports interactive messages but simpler to stick to text 
    // or use their specific interactive format if the user has it set up.
    // For now, keeping Twilio as text fallback as it's more reliable across different Twilio tiers.
    try {
      const result = await client.messages.create({
        body: `${messageText}\n\n1️⃣ Start\n2️⃣ 15 min\n3️⃣ 30 min`,
        from: fromPhone,
        to: `whatsapp:${to.startsWith('+') ? to : '+' + to}`
      });
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('Twilio Interactive Error:', error);
      throw error;
    }
  } else {
    // 'local' implementation - Placeholder for now
    console.log(`[WhatsApp: Local] Sending to ${to}: ${messageText}`);
    return { success: true, provider: 'local', message: 'Logged locally' };
  }
}

export async function sendInteractiveDeadlineWhatsAppReminder(
  to: string,
  taskName: string,
  userName: string,
  todoId: string,
  provider: 'meta' | 'twilio' | 'local' = 'meta'
) {
  const formattedPhone = to.replace('+', '');
  const messageText = `Hey ${userName}! ⚠️\n\n⏰ "${taskName}" is approaching its deadline.\n\nHave you completed it?`;

  if (provider === 'meta') {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v21.0/${META_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: messageText
            },
            action: {
              buttons: [
                {
                  type: 'reply',
                  reply: {
                    id: `DONE_${todoId}`,
                    title: '✅ Done'
                  }
                },
                {
                  type: 'reply',
                  reply: {
                    id: `FAIL_${todoId}`,
                    title: '❌ No'
                  }
                }
              ]
            }
          }
        },
        { headers: { Authorization: `Bearer ${META_TOKEN}` } }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Meta Interactive Deadline Error:', error.response?.data || error.message);
      return sendWhatsAppReminder(to, `${messageText}\n\nReply with "done" or "no".`, 'meta');
    }
  } else if (provider === 'twilio') {
    try {
      const result = await client.messages.create({
        body: `${messageText}\n\nReply:\n- "Done" to complete\n- "No" or "Failed" to mark as incomplete`,
        from: fromPhone,
        to: `whatsapp:${to.startsWith('+') ? to : '+' + to}`
      });
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('Twilio Interactive Deadline Error:', error);
      throw error;
    }
  } else {
    console.log(`[WhatsApp: Local] Sending Deadline Alert to ${to}: ${messageText}`);
    return { success: true, provider: 'local', message: 'Logged locally' };
  }
}
