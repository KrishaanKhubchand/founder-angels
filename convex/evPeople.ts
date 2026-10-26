import { v } from "convex/values";
import { query } from "./_generated/server";
import { evCategoryValidator } from "./schema";
import type { Id } from "./_generated/dataModel";

const CATEGORY_LABEL: Record<string, string> = {
  founder_angel: "Founder + angel",
  founder_only: "Founder",
  institutional_investor: "Institutional",
  angel_only: "Angel",
};

const STATUS_LABEL: Record<string, string> = {
  active_angel: "Active",
  occasional_angel: "Occasional",
  one_disclosed_investment: "One check",
};

export const list = query({
  args: {
    category: v.optional(evCategoryValidator),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const people = args.category
      ? await ctx.db
          .query("evPeople")
          .withIndex("by_category", (q) => q.eq("category", args.category!))
          .collect()
      : await ctx.db.query("evPeople").collect();

    const allInvestments = await ctx.db.query("evInvestments").collect();
    const byPerson = new Map<Id<"evPeople">, typeof allInvestments>();
    for (const inv of allInvestments) {
      const list = byPerson.get(inv.personId) ?? [];
      list.push(inv);
      byPerson.set(inv.personId, list);
    }

    const needle = (args.search ?? "").trim().toLowerCase();
    const rows = [];

    for (const person of people) {
      if (person.checks < 1) continue;
      const investments = byPerson.get(person._id) ?? [];

      if (needle) {
        const hay = [
          person.name,
          person.company,
          CATEGORY_LABEL[person.category] ?? "",
          person.angelStatus ? STATUS_LABEL[person.angelStatus] ?? "" : "",
          ...investments.map((inv) => inv.company),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) continue;
      }

      rows.push({
        _id: person._id,
        name: person.name,
        company: person.company,
        category: person.category,
        categoryLabel: CATEGORY_LABEL[person.category] ?? person.category,
        angelStatus: person.angelStatus,
        angelStatusLabel: person.angelStatus
          ? STATUS_LABEL[person.angelStatus] ?? person.angelStatus
          : undefined,
        checks: person.checks,
        linkedin: person.linkedin,
        twitter: person.twitter,
        evBatch: person.evBatch,
        brief: person.brief,
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
    const people = await ctx.db.query("evPeople").collect();
    const result = {
      all: 0,
      founder_angel: 0,
      founder_only: 0,
      institutional_investor: 0,
      angel_only: 0,
    };
    for (const person of people) {
      if (person.checks < 1) continue;
      result.all += 1;
      if (person.category in result) {
        result[person.category as keyof typeof result] += 1;
      }
    }
    return result;
  },
});
