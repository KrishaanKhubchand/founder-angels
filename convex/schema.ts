import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const statusValidator = v.union(
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
});
