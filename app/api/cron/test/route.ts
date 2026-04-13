import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Testing ke liye console log
  console.log("CRON TRIGGERED AT:", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));

  return NextResponse.json({ 
    success: true, 
    message: "Cron job executed successfully",
    timestamp: new Date().toISOString() 
  });
}
