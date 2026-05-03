import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const logHours = mutation({
  args: {
    entries: v.array(v.object({
      projectId: v.id("projects"),
      taskTitle: v.string(),
      hours: v.number(),
      dayOfWeek: v.union(
        v.literal("monday"),
        v.literal("tuesday"), 
        v.literal("wednesday"),
        v.literal("thursday"),
        v.literal("friday"),
        v.literal("saturday"),
        v.literal("sunday")
      ),
    })),
    weekOf: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const results = [];
    for (const entry of args.entries) {
      const result = await ctx.db.insert("timeEntries", {
        userId,
        ...entry,
        weekOf: args.weekOf,
      });
      results.push(result);
    }
    return results;
  },
});

export const getWeeklyEntries = query({
  args: { weekOf: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("timeEntries")
      .withIndex("by_user_and_week", (q) => q.eq("userId", userId).eq("weekOf", args.weekOf))
      .collect();
  },
});

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const userProfiles = await ctx.db.query("userProfiles").collect();
    const timeEntries = await ctx.db.query("timeEntries").collect();

    const stats = [];
    for (const user of users) {
      const profile = userProfiles.find(p => p.userId === user._id);
      const userEntries = timeEntries.filter(entry => entry.userId === user._id);
      const totalHours = userEntries.reduce((sum, entry) => sum + entry.hours, 0);

      stats.push({
        userId: user._id,
        name: user.name || user.email || "Unknown User",
        jobTitle: profile?.jobTitle || "No Title",
        totalHours,
        entries: userEntries,
      });
    }

    return stats;
  },
});
