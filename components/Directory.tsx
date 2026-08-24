"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo, useState } from "react";

type Filter = "all" | "active_angel" | "occasional_angel" | "one_disclosed_investment";

type Investment = {
  company: string;
  url?: string;
  year?: string;
};

type AngelRow = {
  _id: string;
  name: string;
  company: string;
  status: Filter extends "all" ? never : Exclude<Filter, "all">;
  statusLabel: string;
  checks: number;
  linkedin?: string;
  investments: Investment[];
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active_angel", label: "Active" },
  { id: "occasional_angel", label: "Occasional" },
  { id: "one_disclosed_investment", label: "One check" },
];

const hasConvex = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function Directory() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const status = filter === "all" ? undefined : filter;

  const angels = useQuery(
    api.angels.list,
    hasConvex ? { status, search } : "skip",
  ) as AngelRow[] | undefined;
  const counts = useQuery(api.angels.counts, hasConvex ? {} : "skip") as
    | {
        all: number;
        active_angel: number;
        occasional_angel: number;
        one_disclosed_investment: number;
      }
    | undefined;

  const countFor = useMemo(() => {
    return (id: Filter) => {
      if (!counts) return undefined;
      return id === "all" ? counts.all : counts[id];
    };
  }, [counts]);

  if (!hasConvex) {
    return (
      <div className="rounded-lg border border-line bg-white/50 p-6 text-sm leading-6 text-mute">
        Convex is not linked yet. From this repo run{" "}
        <code className="rounded bg-chip px-1.5 py-0.5 text-ink">npx convex dev</code>
        , create or select a project named <span className="text-ink">founder-angels</span>,
        then{" "}
        <code className="rounded bg-chip px-1.5 py-0.5 text-ink">npx convex run seed:load</code>
        . That writes <code className="rounded bg-chip px-1.5 py-0.5 text-ink">NEXT_PUBLIC_CONVEX_URL</code>{" "}
        into <code className="rounded bg-chip px-1.5 py-0.5 text-ink">.env.local</code>.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((chip) => {
            const active = filter === chip.id;
            const n = countFor(chip.id);
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilter(chip.id)}
                className={`rounded-full border px-3 py-1 text-[13px] transition ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-chip/70 text-ink hover:border-stone-400"
                }`}
              >
                {chip.label}
                {typeof n === "number" ? (
                  <span className={`ml-1.5 ${active ? "text-paper/70" : "text-mute"}`}>
                    {n}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">Search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, company, investment"
            className="w-full rounded-md border border-line bg-white/70 px-3 py-1.5 text-sm text-ink outline-none placeholder:text-mute/80 focus:border-stone-400"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-[#FBF9F4]">
        <table className="min-w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-mute">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Company founded</th>
              <th className="px-4 py-3 font-medium">Classification</th>
              <th className="px-4 py-3 font-medium text-right">Checks</th>
              <th className="px-4 py-3 font-medium">Notable investments</th>
            </tr>
          </thead>
          <tbody>
            {angels === undefined ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-mute">
                  Loading directory…
                </td>
              </tr>
            ) : angels.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-mute">
                  {counts?.all === 0
                    ? "No angels seeded yet. Run npx convex run seed:load"
                    : "No matches."}
                </td>
              </tr>
            ) : (
              angels.map((angel: AngelRow) => (
                <tr
                  key={angel._id}
                  className="border-b border-line/80 last:border-0 hover:bg-white/60"
                >
                  <td className="px-4 py-3 align-top font-medium">
                    {angel.linkedin ? (
                      <a
                        href={angel.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-line underline-offset-4 hover:decoration-ink"
                      >
                        {angel.name}
                      </a>
                    ) : (
                      angel.name
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-mute">{angel.company || "—"}</td>
                  <td className="px-4 py-3 align-top">
                    <span className="rounded-full bg-chip px-2 py-0.5 text-[12px] text-ink">
                      {angel.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-right tabular-nums">{angel.checks}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      {angel.investments.length === 0 ? (
                        <span className="text-mute">—</span>
                      ) : (
                        angel.investments.map((inv: Investment, i: number) =>
                          inv.url ? (
                            <a
                              key={`${inv.company}-${i}`}
                              href={inv.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
                            >
                              {inv.company}
                            </a>
                          ) : (
                            <span key={`${inv.company}-${i}`}>{inv.company}</span>
                          ),
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
