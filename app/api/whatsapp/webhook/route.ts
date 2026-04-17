import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';
import { getGlobalWhatsappStatus } from '@/app/action';
import { getWhatsAppProvider } from '@/services/whatsapp';
import { sendTodoStartReminderTemplate, sendMetaFreeText } from '@/services/whatsapp-templates';
import { processTodoCompletion } from '@/lib/xp-engine';
import { REMINDER_LEAD_TIME_MINS } from '@/lib/constants';

// Twilio signature validation (optional but recommended for production)
const authToken = process.env.TWILIO_AUTH_TOKEN!;

// ─── META WEBHOOK VERIFICATION ─────────────────────────────────────────────
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Meta sends this GET request to verify your webhook URL
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully by Meta');
        return new Response(challenge, { status: 200 });
    }
    console.warn('❌ Webhook verification failed. Token mismatch.');
    return new Response('Forbidden', { status: 403 });
}

// ─── INCOMING MESSAGE HANDLER ──────────────────────────────────────────────
export async function POST(request: Request) {
    try {
        // Check Global Toggle
        const isGlobalEnabled = await getGlobalWhatsappStatus();
        if (!isGlobalEnabled) {
            return new Response('WhatsApp reminders are globally disabled.', { status: 200 });
        }

        const contentType = request.headers.get('content-type') || '';
        let phone = '';
        let body = '';
        let buttonPayload = '';
        let isMeta = false;

        if (contentType.includes('application/json')) {
            // ─── META (WhatsApp Business Cloud API) ────────────────────────
            isMeta = true;
            const json = await request.json();

            // Meta sends status updates (delivered, read, etc.) — ignore them
            const message = json.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
            
            if (!message) return new Response('No message found', { status: 200 });

            phone = message.from; // format: 91XXXXXXXXXX
            if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
                buttonPayload = message.interactive.button_reply.id;
                body = message.interactive.button_reply.title.toUpperCase();
            } else if (message.type === 'text') {
                body = message.text.body.trim().toUpperCase();
            }
        } else {
            // ─── TWILIO (Form Data) ────────────────────────────────────────
            const formData = await request.formData();
            body = formData.get('Body')?.toString().trim().toUpperCase() || '';
            const from = formData.get('From')?.toString(); // Format: whatsapp:+91XXXXXXXXXX
            phone = from?.replace('whatsapp:', '') || '';
        }

        console.log(`📩 Received WhatsApp reply from ${phone}: ${body} (Payload: ${buttonPayload})`);

        if (!phone || (!body && !buttonPayload)) {
            return new Response('Invalid request', { status: 400 });
        }

        // Find the user by phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: phone },
                    { phone: phone.replace('+', '') },
                    { phone: `+${phone}` },
                    { phone: phone.startsWith('91') ? `+${phone}` : phone }
                ]
            }
        });

        if (!user) {
            console.error(`User not found for phone: ${phone}`);
            // Still reply so the user knows something is wrong
            if (isMeta) {
                try {
                    await sendMetaFreeText(phone, "Sorry, I couldn't find your account. Please make sure your phone number is linked in the Habit Tracker app.");
                } catch (e) { /* ignore send errors for unlinked users */ }
            }
            return new Response('User not found', { status: 404 });
        }

        let targetTodoId = '';
        if (buttonPayload) {
            if (buttonPayload.startsWith('DONE_')) targetTodoId = buttonPayload.replace('DONE_', '');
            if (buttonPayload.startsWith('LATER_')) targetTodoId = buttonPayload.replace('LATER_', '');
        }

        let todo;
        if (targetTodoId) {
            todo = await prisma.todo.findUnique({ where: { id: targetTodoId } });
        } else {
            // Fallback to last notified todo
            todo = await prisma.todo.findFirst({
                where: {
                    userId: user.id,
                    whatsappNotified: true,
                    completed: false
                },
                orderBy: { updatedAt: 'desc' }
            });
        }

        if (!todo) {
            const noTodoMsg = `Hey ${user.name || 'there'}! 👋 You don't have any pending todos right now. Keep up the great work!`;
            if (isMeta) {
                await sendMetaFreeText(phone, noTodoMsg);
            }
            return new Response('No pending todo found', { status: 200 });
        }

        let responseMessage = '';
        let nextTodoToRemind: any = null;

        if (buttonPayload.startsWith('DONE_') || body === '1' || body.includes('DONE') || body.includes('YES')) {
            const completionResult = await processTodoCompletion({ prisma, todoId: todo.id });
            const xp = completionResult.earnedXp;

            if (xp < 0) {
                responseMessage = `🔥 Task Marked Done. \n\nAh, we missed our mark and lost ${Math.abs(xp)} XP. It's okay, let's bounce back stronger on the next one!`;
            } else if (xp > 10) {
                responseMessage = `🚀 Awesome velocity, ${user.name || 'there'}! \n\nYou crushed "${todo.task}" early and earned a massive +${xp} XP. Keep that high energy flowing!`;
            } else {
                responseMessage = `✅ Solid job, ${user.name || 'there'}! \n\nTodo "${todo.task}" completed. (+${xp} XP). Keep it up!`;
            }

            // --- CHAIN NEXT TODO ---
            const nextTodo = await prisma.todo.findFirst({
                where: {
                    userId: user.id,
                    completed: false,
                    id: { not: todo.id },
                    status: { notIn: ['failed', 'missed', 'completed'] }
                },
                orderBy: { startTime: 'asc' }
            });

            if (nextTodo) {
                const now = new Date();
                nextTodoToRemind = nextTodo;
                // Force to 'ready' if start time is in the future
                if (!nextTodo.startedAt && nextTodo.startTime && nextTodo.startTime > now) {
                    nextTodoToRemind = await prisma.todo.update({
                        where: { id: nextTodo.id },
                        data: {
                            startTime: now,
                            reminderTime: new Date(now.getTime() - REMINDER_LEAD_TIME_MINS * 60000)
                        }
                    });
                }
                responseMessage += `\n\n🎯 Check below for your next task!`;
            }
        }
        else if (buttonPayload.startsWith('LATER_') || body === '3' || body.includes('LATER')) {
            const newStartTime = new Date(Date.now() + 30 * 60000); // 30 mins later delay
            const newReminderTime = new Date(newStartTime.getTime() - REMINDER_LEAD_TIME_MINS * 60000);
            
            await prisma.todo.update({
                where: { id: todo.id },
                data: {
                    startTime: newStartTime,
                    reminderTime: newReminderTime,
                    delayCount: (todo.delayCount || 0) + 1,
                    lastDelayedAt: new Date(),
                    status: 'upcoming',
                    whatsappNotified: false
                }
            });
            responseMessage = `Understood! 🕒 I've delayed "${todo.task}". I'll catch up with you again soon!`;
        }
        else if (body === '2' || body.includes('NO')) {
            responseMessage = `No problem! 👊 Focus on your work, I'm here if you need anything else.`;
        }
        else {
            responseMessage = `Sorry, I didn't quite get that. Please use the buttons or reply with 1 (YES), 2 (NO), or 3 (LATER).`;
        }

        // ─── SEND REPLY BACK ───────────────────────────────────────────────
        if (isMeta) {
            // Send reply via Meta WhatsApp Cloud API
            try {
                await sendMetaFreeText(phone, responseMessage);
                console.log(`✅ Meta reply sent to ${phone}`);

                if (nextTodoToRemind) {
                    const provider = await getWhatsAppProvider();
                    if (provider === 'meta') {
                        await sendTodoStartReminderTemplate(
                            phone,
                            user.name || 'User',
                            nextTodoToRemind.task,
                            '30',
                            nextTodoToRemind.id
                        );
                    } else {
                        // Fallback provider implementation missing for templates
                        console.log(`Fallback twilio / local not implemented for new templates: ${provider}`);
                    }
                    
                    await prisma.todo.update({
                        where: { id: nextTodoToRemind.id },
                        data: { whatsappNotified: true }
                    });
                }

            } catch (error) {
                console.error('Failed to send Meta reply:', error);
            }
            return new Response('OK', { status: 200 });
        } else {
            // Respond to Twilio via TwiML
            const twiml = new twilio.twiml.MessagingResponse();
            twiml.message(responseMessage);
            return new Response(twiml.toString(), {
                headers: { 'Content-Type': 'text/xml' }
            });
        }

    } catch (error) {
        console.error('Webhook error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
