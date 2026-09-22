import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPlan = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    days: v.array(
      v.object({
        dayLabel: v.string(),
        exercises: v.array(
          v.object({
            name: v.string(),
            sets: v.optional(v.number()),
            reps: v.optional(v.number()),
            durationMinutes: v.optional(v.number()),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, { name, description, days }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    return await ctx.db.insert("workoutPlans", {
      userId,
      name: name.trim(),
      description: description?.trim() || undefined,
      days,
      createdAt: Date.now(),
    });
  },
});

export const deletePlan = mutation({
  args: { id: v.id("workoutPlans") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const plan = await ctx.db.get(id);
    if (!plan || plan.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});

export const listPlans = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("workoutPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
