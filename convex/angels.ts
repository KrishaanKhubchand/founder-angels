import { v } from "convex/values";
import { query } from "./_generated/server";
import { statusValidator } from "./schema";
import type { Id } from "./_generated/dataModel";

const STATUS_LABEL: Record<string, string> = {
  active_angel: "Active",
  occasional_angel: "Occasional",
  one_disclosed_investment: "One check",
};

export const list = query({
  args: {
    status: v.optional(statusValidator),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const angels = args.status
      ? await ctx.db
          .query("angels")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .collect()
      : await ctx.db.query("angels").collect();

    const allInvestments = await ctx.db.query("investments").collect();
    const byAngel = new Map<Id<"angels">, typeof allInvestments>();
    for (const inv of allInvestments) {
      const list = byAngel.get(inv.angelId) ?? [];
      list.push(inv);
      byAngel.set(inv.angelId, list);
    }

    const needle = (args.search ?? "").trim().toLowerCase();
    const rows = [];

    for (const angel of angels) {
      if (angel.checks < 1) continue;
      const investments = byAngel.get(angel._id) ?? [];

      if (needle) {
        const hay = [
          angel.name,
          angel.company,
          STATUS_LABEL[angel.status] ?? "",
          ...investments.map((inv) => inv.company),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) continue;
      }

      rows.push({
        _id: angel._id,
        name: angel.name,
        company: angel.company,
        status: angel.status,
        statusLabel: STATUS_LABEL[angel.status] ?? angel.status,
        checks: angel.checks,
        linkedin: angel.linkedin,
        investments: investments.map((inv) => ({
          company: inv.company,
          url: inv.url,
          year: inv.year,
        })),
      });
    }

    rows.sort((a, b) => b.checks - a.checks || a.name.localeCompare(b.name));
    return rows;
  },
});

export const counts = query({
  args: {},
  handler: async (ctx) => {
    const angels = await ctx.db.query("angels").collect();
    const result = {
      all: 0,
      active_angel: 0,
      occasional_angel: 0,
      one_disclosed_investment: 0,
    };
    for (const angel of angels) {
      if (angel.checks < 1) continue;
      result.all += 1;
      if (angel.status in result) {
        result[angel.status as keyof typeof result] += 1;
      }
    }
    return result;
  },
});
