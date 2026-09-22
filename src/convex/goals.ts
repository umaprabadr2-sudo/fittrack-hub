import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createGoal = mutation({
  args: {
    title: v.string(),
    type: v.union(
      v.literal("weight_loss"),
      v.literal("muscle_gain"),
      v.literal("endurance"),
      v.literal("custom"),
    ),
    targetValue: v.number(),
    currentValue: v.number(),
    unit: v.string(),
    direction: v.union(v.literal("up"), v.literal("down")),
    targetDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    return await ctx.db.insert("goals", {
      userId,
      title: args.title.trim(),
      type: args.type,        targetValue: args.targetValue,
        currentValue: args.currentValue,
        startValue: args.currentValue,
        unit: args.unit,
      direction: args.direction,
      targetDate: args.targetDate,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

export const updateGoalProgress = mutation({
  args: { id: v.id("goals"), currentValue: v.number() },
  handler: async (ctx, { id, currentValue }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const goal = await ctx.db.get(id);
    if (!goal || goal.userId !== userId) throw new Error("Not found");

    const reached =
      goal.direction === "down"
        ? currentValue <= goal.targetValue
        : currentValue >= goal.targetValue;

    await ctx.db.patch(id, {
      currentValue,
      status: reached ? "achieved" : "active",
    });
  },
});

export const deleteGoal = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const goal = await ctx.db.get(id);
    if (!goal || goal.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});

export const listGoals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
