import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // ---- FitTrack domain tables ----

    // Logged workout sessions
    workoutLogs: defineTable({
      userId: v.id("users"),
      date: v.string(), // YYYY-MM-DD
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
      caloriesBurned: v.number(),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_user_date", ["userId", "date"])
      .index("by_user", ["userId"]),

    // Daily health metrics (steps, resting heart rate)
    dailyMetrics: defineTable({
      userId: v.id("users"),
      date: v.string(), // YYYY-MM-DD
      steps: v.optional(v.number()),
      restingHeartRate: v.optional(v.number()),
    })
      .index("by_user_date", ["userId", "date"])
      .index("by_user", ["userId"]),

    // Fitness goals with progress + milestones
    goals: defineTable({
      userId: v.id("users"),
      title: v.string(),
      type: v.union(
        v.literal("weight_loss"),
        v.literal("muscle_gain"),
        v.literal("endurance"),
        v.literal("custom"),
      ),
      targetValue: v.number(),
      currentValue: v.number(),
      startValue: v.number(),
      unit: v.string(),
      direction: v.union(v.literal("up"), v.literal("down")),
      targetDate: v.optional(v.string()),
      status: v.union(v.literal("active"), v.literal("achieved")),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // Custom workout plans (days -> exercises)
    workoutPlans: defineTable({
      userId: v.id("users"),
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
      createdAt: v.number(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
