import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ─── COSTOS ──────────────────────────────────────────────────────────────────

export const addCostEntry = mutation({
  args: {
    projectId: v.id("projects"),
    category: v.union(
      v.literal("labor"),
      v.literal("materials"),
      v.literal("software"),
      v.literal("equipment"),
      v.literal("other")
    ),
    amount: v.number(),
    description: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("costEntries", { userId, ...args });
  },
});

export const deleteCostEntry = mutation({
  args: { id: v.id("costEntries") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.id);
  },
});

export const listCostEntries = query({
  args: { projectId: v.optional(v.id("projects")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.projectId) {
      return await ctx.db
        .query("costEntries")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("costEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ─── INGRESOS ─────────────────────────────────────────────────────────────────

export const addIncomeEntry = mutation({
  args: {
    projectId: v.id("projects"),
    type: v.union(
      v.literal("project_payment"),
      v.literal("milestone"),
      v.literal("bonus"),
      v.literal("recurring"),
      v.literal("other")
    ),
    amount: v.number(),
    description: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("incomeEntries", { userId, ...args });
  },
});

export const deleteIncomeEntry = mutation({
  args: { id: v.id("incomeEntries") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.id);
  },
});

export const listIncomeEntries = query({
  args: { projectId: v.optional(v.id("projects")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.projectId) {
      return await ctx.db
        .query("incomeEntries")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("incomeEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ─── RESUMEN PARA RENTABILIDAD ────────────────────────────────────────────────

export const getProfitabilitySummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const [projects, costEntries, incomeEntries] = await Promise.all([
      ctx.db.query("projects").collect(),
      ctx.db.query("costEntries").collect(),
      ctx.db.query("incomeEntries").collect(),
    ]);

    const totalCosts = costEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalCosts;
    const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Por proyecto
    const byProject = projects.map((project) => {
      const costs = costEntries
        .filter((e) => e.projectId === project._id)
        .reduce((sum, e) => sum + e.amount, 0);
      const income = incomeEntries
        .filter((e) => e.projectId === project._id)
        .reduce((sum, e) => sum + e.amount, 0);
      const profit = income - costs;
      const projectMargin = income > 0 ? (profit / income) * 100 : 0;

      return {
        id: project._id,
        name: project.name,
        status: project.status,
        income,
        costs,
        profit,
        margin: Math.round(projectMargin * 10) / 10,
      };
    });

    // Costos por categoría
    const costsByCategory = costEntries.reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalIncome,
      totalCosts,
      netProfit,
      margin: Math.round(margin * 10) / 10,
      byProject,
      costsByCategory,
    };
  },
});
