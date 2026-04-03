"use client";
import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Smartphone } from "lucide-react";


const messagesFlow: Message[] = [
  { type: "bot",  time: "9:00 PM", text: "Hey! 👋 What did you get done today?\nTell me — gym, coding, finance, reading…" },
  { type: "user", time: "9:01 PM", text: "Gym done 💪 and pushed 3 commits" },
  { type: "bot",  time: "9:01 PM", text: "💪 Gym session logged! +15 XP\n⚡ GitHub sync picked up 3 commits. +20 XP\nStreak: 🔥 7 days — you're on fire!" },
  { type: "user", time: "9:02 PM", text: "Didn't read today 😅" },
  { type: "bot",  time: "9:02 PM", text: "No worries 👍 Marked as pending.\nYour shield is protecting your streak tonight.\nLet's hit it tomorrow!" },
  { type: "user", time: "9:03 PM", text: "Check my streak 🔥" },
  { type: "bot",  time: "9:03 PM", text: "🌳 Your tree is at Stage 4 — Young Tree!\nStreak: 🔥 7 days · XP: 284 / 290\nKeep going to unlock Full Tree!" },
];

type Message = { type: "bot" | "user";  time: string; text: string };

const WhatsappPlayground = () => {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (index >= messagesFlow.length) {
      // Loop restart
      setTimeout(() => {
        setVisibleMessages([]);
        setIndex(0);
      }, 2000);
      return;
    }

    setTyping(true);

    const timer = setTimeout(() => {
      setTyping(false);
      setVisibleMessages((prev) => [...prev, messagesFlow[index]]);
      setIndex((prev) => prev + 1);
    }, 1200);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Card className="mb-10 rounded-[2.5rem] p-6 md:p-10">
      <div className="flex flex-col md:flex-row items-center gap-10">

        {/* LEFT */}
        <div className="flex flex-col w-full md:w-1/2">
          <div className="w-20 h-20 rounded-xl bg-indigo-500/10 border border-indigo-500 flex items-center justify-center mb-4">
            <Smartphone />
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            Log via WhatsApp
          </h1>

          <p className="text-gray-400 text-sm md:text-base max-w-md">
            Just reply to your daily WhatsApp prompts. UFL tracks your todos,
            habits, and finances automatically — no app needed.
          </p>
        </div>

        {/* RIGHT CHAT */}
        <div className="w-full md:w-1/2">
          <div className="rounded-[2rem] bg-gradient-to-tr from-indigo-500/10 to-indigo-500/10 border border-indigo-500/30 p-6 space-y-3 h-[320px] overflow-hidden flex flex-col justify-end">

            {visibleMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-sm max-w-[80%] whitespace-pre-line ${
                  msg.type === "user"
                    ? "bg-indigo-600 text-white ml-auto"
                    : "bg-gray-800 text-white"
                }`}
              >
                {msg.type === "bot" && (
                  <p className="text-gray-400 text-xs mb-1">UFL Bot</p>
                )}
                {msg.text}
              </div>
            ))}

            {/* Typing Indicator
            {typing && (
              <div className="bg-gray-800 text-white px-4 py-2 rounded-xl w-fit text-sm">
                <span className="animate-pulse">Typing...</span>
              </div>
            )} */}

          </div>
        </div>

      </div>
    </Card>
  );
};

export default WhatsappPlayground;