import EvDirectory from "@/components/EvDirectory";

export default function EvPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <header className="mb-10 max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.18em] text-mute">Public directory</p>
        <h1 className="mt-2 text-[32px] font-medium tracking-tight text-ink">
          Emergent Ventures grantees
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-mute">
          Sourced from{" "}
          <a
            href="https://evwinners.org"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            evwinners.org
          </a>
          . Filtered for founders, angels, and institutional investors who have made
          personal checks. Same check-count rules as the main founder-angels directory.
        </p>
      </header>
      <EvDirectory />
    </main>
  );
}
