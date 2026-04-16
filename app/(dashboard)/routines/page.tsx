import RoutineManager from "@/components/routines/RoutineManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Routines | Habit Tracker",
  description:
    "Create and manage your daily routine templates. Activate one to guide your AI daily planner.",
};

export default function RoutinesPage() {
  return <RoutineManager />;
}
