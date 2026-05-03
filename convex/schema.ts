import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  projects: defineTable({
    name: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    status: v.union(v.literal("planning"), v.literal("active"), v.literal("review"), v.literal("completed")),
    progress: v.number(),
    dueDate: v.string(),
    createdBy: v.id("users"),
  }).index("by_created_by", ["createdBy"]),

  timeEntries: defineTable({
    userId: v.id("users"),
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
    weekOf: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_week", ["weekOf"])
    .index("by_user_and_week", ["userId", "weekOf"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    jobTitle: v.string(),
    department: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  projectMembers: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_and_user", ["projectId", "userId"]),

  // Registros de costos del proyecto
  costEntries: defineTable({
    userId: v.id("users"),
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
    date: v.string(), // ISO date string
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_date", ["date"]),

  // Registros de ingresos del proyecto
  incomeEntries: defineTable({
    userId: v.id("users"),
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
    date: v.string(), // ISO date string
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_date", ["date"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
