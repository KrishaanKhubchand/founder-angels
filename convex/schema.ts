import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const statusValidator = v.union(
  v.literal("active_angel"),
  v.literal("occasional_angel"),
  v.literal("one_disclosed_investment"),
);

export const evCategoryValidator = v.union(
  v.literal("founder_angel"),
  v.literal("founder_only"),
  v.literal("institutional_investor"),
  v.literal("angel_only"),
);

export const evAngelStatusValidator = v.union(
  v.literal("active_angel"),
  v.literal("occasional_angel"),
  v.literal("one_disclosed_investment"),
);

export default defineSchema({
  angels: defineTable({
    name: v.string(),
    company: v.string(),
    status: statusValidator,
    checks: v.number(),
    linkedin: v.optional(v.string()),
  })
    .index("by_checks", ["checks"])
    .index("by_status", ["status"])
    .index("by_name", ["name"]),
  investments: defineTable({
    angelId: v.id("angels"),
    company: v.string(),
    url: v.optional(v.string()),
    year: v.optional(v.string()),
  }).index("by_angel", ["angelId"]),
  evPeople: defineTable({
    name: v.string(),
    company: v.string(),
    category: evCategoryValidator,
    angelStatus: v.optional(evAngelStatusValidator),
    checks: v.number(),
    linkedin: v.optional(v.string()),
    twitter: v.optional(v.string()),
    evBatch: v.optional(v.string()),
    brief: v.optional(v.string()),
  })
    .index("by_checks", ["checks"])
    .index("by_category", ["category"])
    .index("by_name", ["name"]),
  evInvestments: defineTable({
    personId: v.id("evPeople"),
    company: v.string(),
    url: v.optional(v.string()),
    year: v.optional(v.string()),
  }).index("by_person", ["personId"]),
});
