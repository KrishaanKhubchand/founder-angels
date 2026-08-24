import Directory from "@/components/Directory";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <header className="mb-10 max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.18em] text-mute">Public directory</p>
        <h1 className="mt-2 text-[32px] font-medium tracking-tight text-ink">
          Founder angels
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-mute">
          Sourced founder-operators who have made personal angel checks. Sorted by check
          count. No login, no emails — names, companies, classification, and public
          investment sources only.
        </p>
      </header>
      <Directory />
    </main>
  );
}
