import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CATEGORIES = ["strength", "cardio", "flexibility"] as const;
export const INTENSITIES = ["low", "moderate", "high"] as const;

/** MET values used to estimate calories burned (70 kg reference body weight). */
const MET: Record<string, Record<string, number>> = {
  strength: { low: 3.5, moderate: 5.0, high: 6.5 },
  cardio: { low: 5.0, moderate: 8.0, high: 11.0 },
  flexibility: { low: 2.5, moderate: 3.0, high: 4.0 },
};

export function estimateCalories(
  category: string,
  intensity: string,
  minutes: number,
): number {
  const met = MET[category]?.[intensity] ?? 5;
  return Math.round(((met * 3.5 * 70) / 200) * minutes);
}

export const logWorkout = mutation({
  args: {
    date: v.string(),
    exerciseName: v.string(),
    category: v.union(
      v.literal("strength"),
      v.literal("cardio"),
      v.literal("flexibility"),
    ),
    durationMinutes: v.number(),
    intensity: v.union(
      v.literal("low"),
      v.literal("moderate"),
      v.literal("high"),
    ),
    sets: v.optional(v.number()),
    reps: v.optional(v.number()),
    weightKg: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    return await ctx.db.insert("workoutLogs", {
      userId,
      date: args.date,
      exerciseName: args.exerciseName.trim(),
      category: args.category,
      durationMinutes: args.durationMinutes,
      intensity: args.intensity,
      sets: args.sets,
      reps: args.reps,
      weightKg: args.weightKg,
      caloriesBurned: estimateCalories(
        args.category,
        args.intensity,
        args.durationMinutes,
      ),
      notes: args.notes?.trim() || undefined,
      createdAt: Date.now(),
    });
  },
});

export const deleteWorkout = mutation({
  args: { id: v.id("workoutLogs") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const log = await ctx.db.get(id);
    if (!log || log.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});

/** Recent workout logs, newest first, limited. */
export const listWorkouts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("workoutLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? 50);
  },
});

/** Workouts for one specific day (YYYY-MM-DD). */
export const workoutsForDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("workoutLogs")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .collect();
  },
});

export const workoutStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const windowDays = days ?? 30;
    const since = isoDateDaysAgo(windowDays - 1);
    const logs = await ctx.db
      .query("workoutLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const inWindow = logs.filter((l) => l.date >= since);
    const totalMinutes = inWindow.reduce((s, l) => s + l.durationMinutes, 0);
    const totalCalories = inWindow.reduce((s, l) => s + l.caloriesBurned, 0);
    const uniqueDates = new Set(inWindow.map((l) => l.date));

    // daily totals for the window, oldest -> newest
    const daily = [];
    for (let i = 0; i < windowDays; i++) {
      const date = isoDateDaysAgo(windowDays - 1 - i);
      const dayLogs = inWindow.filter((l) => l.date === date);
      daily.push({
        date,
        minutes: dayLogs.reduce((s, l) => s + l.durationMinutes, 0),
        calories: dayLogs.reduce((s, l) => s + l.caloriesBurned, 0),
      });
    }

    const byCategory = (["strength", "cardio", "flexibility"] as const).map(
      (category) => ({
        category,
        minutes: inWindow
          .filter((l) => l.category === category)
          .reduce((s, l) => s + l.durationMinutes, 0),
      }),
    );

    return {
      totalWorkouts: inWindow.length,
      activeDays: uniqueDates.size,
      totalMinutes,
      totalCalories,
      daily,
      byCategory,
    };
  },
});

function isoDateDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}
