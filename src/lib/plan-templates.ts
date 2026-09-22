import type { WorkoutCategory } from "@/lib/fitness";

export interface PlanExercise {
  name: string;
  sets?: number;
  reps?: number;
  durationMinutes?: number;
}

export interface PlanDay {
  dayLabel: string;
  exercises: PlanExercise[];
}

export interface PlanTemplate {
  name: string;
  description: string;
  category: WorkoutCategory | "hybrid";
  days: PlanDay[];
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    name: "Full Body Strength",
    description: "Three balanced strength days covering every major muscle group.",
    category: "strength",
    days: [
      {
        dayLabel: "Day A",
        exercises: [
          { name: "Barbell Back Squat", sets: 3, reps: 8 },
          { name: "Bench Press", sets: 3, reps: 8 },
          { name: "Dumbbell Row", sets: 3, reps: 10 },
        ],
      },
      {
        dayLabel: "Day B",
        exercises: [
          { name: "Deadlift", sets: 3, reps: 5 },
          { name: "Overhead Press", sets: 3, reps: 8 },
          { name: "Pull-Up", sets: 3, reps: 8 },
        ],
      },
      {
        dayLabel: "Day C",
        exercises: [
          { name: "Romanian Deadlift", sets: 3, reps: 10 },
          { name: "Push-Up", sets: 3, reps: 15 },
          { name: "Dumbbell Row", sets: 3, reps: 12 },
        ],
      },
    ],
  },
  {
    name: "Cardio Base Builder",
    description: "Steady-state conditioning block to raise your aerobic floor.",
    category: "cardio",
    days: [
      {
        dayLabel: "Easy Run",
        exercises: [{ name: "Treadmill Run", durationMinutes: 30 }],
      },
      {
        dayLabel: "Intervals",
        exercises: [{ name: "Jump Rope", durationMinutes: 20 }],
      },
      {
        dayLabel: "Long Ride",
        exercises: [{ name: "Outdoor Cycling", durationMinutes: 60 }],
      },
    ],
  },
  {
    name: "Mobility & Recovery",
    description: "Low-intensity flexibility work for rest days and desk workers.",
    category: "flexibility",
    days: [
      {
        dayLabel: "Flow",
        exercises: [{ name: "Vinyasa Yoga Flow", durationMinutes: 25 }],
      },
      {
        dayLabel: "Deep Stretch",
        exercises: [
          { name: "Seated Forward Fold", durationMinutes: 10 },
          { name: "Hip Flexor Stretch", durationMinutes: 10 },
        ],
      },
    ],
  },
];
