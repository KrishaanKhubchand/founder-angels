import { mutation } from "./_generated/server";
import seedAngels from "./seedData.json";

const ALLOWED = new Set([
  "active_angel",
  "occasional_angel",
  "one_disclosed_investment",
]);

type RawAngel = {
  name: string;
  company?: string;
  status: string;
  checks?: number;
  linkedin?: string;
  investments?: { company?: string; url?: string; year?: string | number }[];
};

export const load = mutation({
  args: {},
  handler: async (ctx) => {
    const existingInvestments = await ctx.db.query("investments").collect();
    for (const row of existingInvestments) {
      await ctx.db.delete(row._id);
    }
    const existingAngels = await ctx.db.query("angels").collect();
    for (const row of existingAngels) {
      await ctx.db.delete(row._id);
    }

    let inserted = 0;
    let skipped = 0;
    let investmentCount = 0;

    for (const raw of seedAngels as RawAngel[]) {
      const status = raw.status;
      const checks = Number(raw.checks ?? 0);
      if (!ALLOWED.has(status) || checks < 1) {
        skipped += 1;
        continue;
      }

      const angelId = await ctx.db.insert("angels", {
        name: raw.name.trim(),
        company: (raw.company ?? "").trim(),
        status: status as
          | "active_angel"
          | "occasional_angel"
          | "one_disclosed_investment",
        checks,
        linkedin: raw.linkedin?.trim() || undefined,
      });
      inserted += 1;

      for (const inv of raw.investments ?? []) {
        const company = (inv.company ?? "").trim();
        if (!company) continue;
        const year = String(inv.year ?? "").trim();
        await ctx.db.insert("investments", {
          angelId,
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
