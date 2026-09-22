import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const upsertDailyMetrics = mutation({
  args: {
    date: v.string(),
    steps: v.optional(v.number()),
    restingHeartRate: v.optional(v.number()),
  },
  handler: async (ctx, { date, steps, restingHeartRate }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("dailyMetrics")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(steps !== undefined ? { steps } : {}),
        ...(restingHeartRate !== undefined ? { restingHeartRate } : {}),
      });
      return existing._id;
    }

    return await ctx.db.insert("dailyMetrics", {
      userId,
      date,
      steps,
      restingHeartRate,
    });
  },
});

/** Daily metrics for the last N days, oldest -> newest. */
export const recentMetrics = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const windowDays = days ?? 14;
    const since = isoDateDaysAgo(windowDays - 1);
    const rows = await ctx.db
      .query("dailyMetrics")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const byDate = new Map(rows.map((r) => [r.date, r]));
    const out = [];
    for (let i = 0; i < windowDays; i++) {
      const date = isoDateDaysAgo(windowDays - 1 - i);
      const row = byDate.get(date);
      out.push({
        date,
        steps: row?.steps,
        restingHeartRate: row?.restingHeartRate,
      });
    }
    return out;
  },
});

export const metricsForDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db
      .query("dailyMetrics")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .unique();
  },
});

/** Simple 7-day moving average of resting heart rate, or null if no data. */
export const rhrTrend = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const rows = await ctx.db
      .query("dailyMetrics")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const withRhr = rows
      .filter((r) => r.restingHeartRate !== undefined)
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    if (withRhr.length === 0) return null;
    const last7 = withRhr.slice(-7);
    const avg =
      last7.reduce((s, r) => s + (r.restingHeartRate ?? 0), 0) / last7.length;
    return Math.round(avg);
  },
});

function isoDateDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}
