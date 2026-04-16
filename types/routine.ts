// Shared types for the Routine Builder feature

export interface RoutineTask {
  id: string;
  title: string;
  category: string | null;
  startTime: string;   // "HH:MM" 24h
  duration: number;    // minutes
  notes: string | null;
  order: number;
}

export interface Routine {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  wakeUpTime: string;
  color: string | null;
  emoji: string | null;
  tasks: RoutineTask[];
  createdAt: string;
}
