import { NextResponse } from 'next/server';
import { sendInteractiveWhatsAppReminder } from '@/services/whatsapp';
import { getWhatsAppProvider } from '@/services/whatsapp';

export async function POST(req: Request) {
  try {
    const { phone, task, name, todoId } = await req.json();

    const provider = await getWhatsAppProvider();

    await sendInteractiveWhatsAppReminder(
      phone,
      task,
      name || 'User',
      todoId,
      provider
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}