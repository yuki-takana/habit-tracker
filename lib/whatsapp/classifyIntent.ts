export type WhatsAppIntent =
  | "check_status"       // "how am I doing?" / "what's my progress?"
  | "log_habit"          // "I went to the gym" / "I read for 30 mins"
  | "complete_todo"      // "done with the API task"
  | "ask_what_to_do"     // "what should I do now?" / "what's next?"
  | "request_motivation" // "I'm feeling lazy" / "motivate me"
  | "report_blocker"     // "I'm stuck on X" / "couldn't do Y"
  | "general_chat";      // everything else

const INTENT_PATTERNS: Record<WhatsAppIntent, RegExp[]> = {
  check_status: [
    /how am i doing/i,
    /my progress/i,
    /\bstatus\b/i,
    /\bscore\b/i,
    /\bstreak\b/i,
    /\bxp\b/i,
    /dashboard/i,
    /how('s| is) my/i,
  ],
  log_habit: [
    /i (went|did|completed|finished|hit|ran|worked out|meditated|read|studied)/i,
    /done with/i,
    /just (did|completed|finished|went|hit)/i,
    /completed my/i,
    /finished my/i,
  ],
  complete_todo: [
    /mark.*done/i,
    /task.*done/i,
    /todo.*done/i,
    /finished (the|my)/i,
  ],
  ask_what_to_do: [
    /what should i/i,
    /what('s| is) next/i,
    /\bsuggest\b/i,
    /\brecommend\b/i,
    /what (to|can) do/i,
    /help me (plan|decide|prioritize)/i,
    /what.*focus/i,
  ],
  request_motivation: [
    /\bmotivate\b/i,
    /\blazy\b/i,
    /\btired\b/i,
    /not feeling it/i,
    /\bstruggling\b/i,
    /need a push/i,
    /feeling (down|low|unmotivated|burnt)/i,
    /can't (get|be) bothered/i,
  ],
  report_blocker: [
    /\bstuck\b/i,
    /can't\b/i,
    /couldn't\b/i,
    /\bblocked\b/i,
    /problem with/i,
    /issue with/i,
    /\bstruggle\b/i,
    /not working/i,
    /keeps failing/i,
  ],
  general_chat: [],
};

/**
 * Classifies incoming WhatsApp message text into an intent bucket.
 * Falls back to "general_chat" if no pattern matches.
 */
export function classifyIntent(message: string): WhatsAppIntent {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS) as [
    WhatsAppIntent,
    RegExp[],
  ][]) {
    if (intent === "general_chat") continue;
    if (patterns.some((p) => p.test(message))) return intent;
  }
  return "general_chat";
}
