import { mutation } from "./_generated/server";
import seedEvData from "./seedEvData.json";

const ALLOWED_CATEGORIES = new Set([
  "founder_angel",
  "founder_only",
  "institutional_investor",
  "angel_only",
]);

const ALLOWED_ANGEL_STATUS = new Set([
  "active_angel",
  "occasional_angel",
  "one_disclosed_investment",
]);

type RawEvPerson = {
  name: string;
  company?: string;
  category: string;
  angelStatus?: string;
  checks?: number;
  linkedin?: string;
  twitter?: string;
  evBatch?: string;
  brief?: string;
  investments?: { company?: string; url?: string; year?: string | number }[];
};

export const load = mutation({
  args: {},
  handler: async (ctx) => {
    const existingInvestments = await ctx.db.query("evInvestments").collect();
    for (const row of existingInvestments) {
      await ctx.db.delete(row._id);
    }
    const existingPeople = await ctx.db.query("evPeople").collect();
    for (const row of existingPeople) {
      await ctx.db.delete(row._id);
    }

    let inserted = 0;
    let skipped = 0;
    let investmentCount = 0;

    for (const raw of seedEvData as RawEvPerson[]) {
      const category = raw.category;
      const checks = Number(raw.checks ?? 0);
      if (!ALLOWED_CATEGORIES.has(category) || checks < 1) {
        skipped += 1;
        continue;
      }

      const angelStatus = raw.angelStatus;
      if (angelStatus && !ALLOWED_ANGEL_STATUS.has(angelStatus)) {
        skipped += 1;
        continue;
      }

      const personId = await ctx.db.insert("evPeople", {
        name: raw.name.trim(),
        company: (raw.company ?? "").trim(),
        category: category as
          | "founder_angel"
          | "founder_only"
          | "institutional_investor"
          | "angel_only",
        angelStatus: angelStatus
          ? (angelStatus as
              | "active_angel"
              | "occasional_angel"
              | "one_disclosed_investment")
          : undefined,
        checks,
        linkedin: raw.linkedin?.trim() || undefined,
        twitter: raw.twitter?.trim() || undefined,
        evBatch: raw.evBatch?.trim() || undefined,
        brief: raw.brief?.trim() || undefined,
      });
      inserted += 1;

      for (const inv of raw.investments ?? []) {
        const company = (inv.company ?? "").trim();
        if (!company) continue;
        const year = String(inv.year ?? "").trim();
        await ctx.db.insert("evInvestments", {
          personId,
          company,
          url: (inv.url ?? "").trim() || undefined,
          year: year || undefined,
        });
        investmentCount += 1;
      }
    }

    return { inserted, skipped, investmentCount };
  },
});
