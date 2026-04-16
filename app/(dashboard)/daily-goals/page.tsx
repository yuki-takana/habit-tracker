import DailyGoalsArchitect from "@/components/DailyGoals";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Goals | Habit Tracker",
  description: "Your AI-powered daily schedule — see what to do, when, and track your progress in real time.",
};

export default function DailyGoalsPage() {
  return <DailyGoalsArchitect />;
}
