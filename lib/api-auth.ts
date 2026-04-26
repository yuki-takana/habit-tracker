import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";

// The Next-Auth session user type, augmented with our custom fields from lib/auth.ts
export type AuthUser = Session["user"] & {
  id: string;
  phone?: string;
  wakeUpTime?: string;
  whatsappEnabled?: boolean;
  wakatimeApiKey?: string;
  githubApiKey?: string;
};

export type ApiHandler = (
  req: NextRequest,
  context: any,
  user: AuthUser
) => Promise<NextResponse | Response> | NextResponse | Response;

/**
 * A wrapper for API routes that requires authentication.
 * It automatically handles session checking, error catching, and passes the authenticated user to the handler.
 */
export function withAuth(handler: ApiHandler) {
  return async (req: NextRequest, context: any) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user || !(session.user as AuthUser).id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return await handler(req, context, session.user as AuthUser);
    } catch (error) {
      console.error(`[API Error] ${req.method} ${req.nextUrl.pathname}:`, error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}
