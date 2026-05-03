import { prisma } from "@/lib/prisma";
import { model } from "@/lib/gemini";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { classifyIntent } from "@/lib/whatsapp/classifyIntent";
import { buildWhatsAppContext } from "@/lib/whatsapp/buildWhatsAppContext";

export async function POST(req: Request) {
  const { phone, text, pushname } = await req.json();

  if (!phone || !text) return Response.json({ success: true });

  // 1. Normalize phone and find user
  const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
  console.log("[whatsapp-webhook] incoming:", formattedPhone, text, pushname);

  const user = await prisma.user.findFirst({
    where: { phone: formattedPhone },
    select: { id: true, name: true },
  });

  if (!user) {
    // Unknown user — send a generic reply via the local bridge
    await sendBridgeMessage(phone, "Hey! Please log in to UFL first to link your WhatsApp. 🔗");
    return Response.json({ success: true });
  }

  // 2. Classify intent
  const intent = classifyIntent(text);
  console.log("[whatsapp-webhook] intent:", intent);

  // 3. Build full context (today stats + agent memory)
  const { todayStats, agentContext } = await buildWhatsAppContext(user.id);

  // 4. Build prompts
  const systemPrompt = `You are UFL's WhatsApp assistant — a sharp, direct life coach for builders and developers.
You know this user's full context:

${agentContext}

RULES:
- Keep replies under 200 words
- Use WhatsApp formatting: *bold*, _italic_, emojis sparingly
- Be personal — use their actual data (streak, todos, habits) in your reply
- For check_status: give a punchy dashboard summary
- For ask_what_to_do: suggest their top 1-2 pending todos + why
- For report_blocker: acknowledge it and give one concrete next step
- For request_motivation: be direct, not generic — reference their actual progress
- Never say "I don't have access to your data" — you do, use it
- End with one clear action they should take right now`;

  const userPrompt = `User message: "${text}"
Intent detected: ${intent}

Today's quick stats:
- Todos: ${todayStats.todosCompleted}/${todayStats.todosTotal} done (${todayStats.completionPct}%)
- Streak: ${todayStats.streak} days | Shields: ${todayStats.shields}
- XP today: ${todayStats.xpToday} | Total XP: ${todayStats.totalXp} | Level ${todayStats.level}
- Active task: ${todayStats.activeSession?.task ?? "none"}
- Pending: ${todayStats.pendingTodos.join(", ") || "all clear"}
- Habits logged: ${todayStats.habitNames.join(", ") || "none yet"}

Reply in context.`;

  // 5. Generate reply using the project's LLM (Groq/Gemini/Grok)
  const aiResponse = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);
  const replyText = aiResponse.content.toString();

  console.log("[whatsapp-webhook] reply:", replyText);

  // 6. Send reply via local WhatsApp bridge
  await sendBridgeMessage(phone, replyText);

  // 7. Save conversation to ChatMessage (keep existing history behavior)
  await prisma.chatMessage.createMany({
    data: [
      { userId: user.id, role: "user", content: text },
      { userId: user.id, role: "assistant", content: replyText },
    ],
  });

  // 8. Log the decision to AgentDecisionLog for audit trail
  await prisma.agentDecisionLog.create({
    data: {
      userId: user.id,
      agentId: "whatsapp_bot",
      domain: "global",
      actionType: "whatsapp_reply_sent",
      inputContext: {
        intent,
        userMessage: text,
        todosCompleted: todayStats.todosCompleted,
        todosTotal: todayStats.todosTotal,
        streak: todayStats.streak,
      },
      decision: { messageText: replyText.slice(0, 500) },
      outcome: "pending",
    },
  });

  return Response.json({ success: true });
}

/** Sends a message via the local WhatsApp bridge server */
async function sendBridgeMessage(phone: string, message: string) {
  try {
    await fetch("http://localhost:4000/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    });
  } catch {
    console.error("[whatsapp-webhook] Bridge unreachable — is the local server running?");
  }
}