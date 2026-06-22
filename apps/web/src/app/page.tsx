import Link from 'next/link';

/**
 * Page signature: a single-elimination bracket reduced to its essential lines.
 * The bracket is the heart of the product, so it carries the hero rather than a
 * generic gradient or stat block.
 */
function BracketMark() {
  return (
    <svg viewBox="0 0 320 260" fill="none" className="h-full w-full" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5" className="text-white/15">
        <path d="M16 30 H88 V70 H160" />
        <path d="M16 110 H88 V70" />
        <path d="M16 150 H88 V190 H160" />
        <path d="M16 230 H88 V190" />
        <path d="M160 70 H232 V130 H300" />
        <path d="M160 190 H232 V130" />
      </g>
      <circle cx="300" cy="130" r="4" className="fill-podium" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6">
      <header className="flex items-center justify-between py-6">
        <span className="font-display text-lg font-bold tracking-tight">
          open<span className="text-podium">mat</span>
        </span>
        <Link
          href="/events"
          className="text-sm text-muted transition-colors hover:text-chalk focus-visible:text-chalk"
        >
          Events
        </Link>
      </header>

      <section className="grid flex-1 items-center gap-10 py-12 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.25em] text-podium">
            Tournament software
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] sm:text-6xl">
            Run the whole bracket,
            <br />
            from sign-up to the podium.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            Registration, seeding, and matside scoring for grappling and combat sports — built to
            keep working when the venue Wi-Fi doesn&apos;t.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/events"
              className="rounded-md bg-podium px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-podium"
            >
              Browse events
            </Link>
            <a
              href="https://github.com"
              className="rounded-md border border-white/15 px-5 py-2.5 text-sm font-semibold text-chalk transition-colors hover:border-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              Documentation
            </a>
          </div>
        </div>

        <div className="hidden h-64 md:block">
          <BracketMark />
        </div>
      </section>

      <footer className="border-t border-white/10 py-6 text-sm text-muted">
        Three rulesets, offline-first scoring, one source of truth.
      </footer>
    </main>
  );
}
