import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const projects = await ctx.db.query("projects").collect();
    return projects.map(project => ({
      ...project,
      createdAt: project._creationTime,
    }));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    dueDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("projects", {
      ...args,
      status: "planning",
      progress: 0,
      createdBy: userId,
    });
  },
});
