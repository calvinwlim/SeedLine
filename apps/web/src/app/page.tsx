import Link from 'next/link';
import { ButtonLink } from '../components/ui/button';
import { Container } from '../components/ui/container';
import { FeaturedEvents } from '../components/featured-events';
import { Marquee } from '../components/editorial/marquee';

/**
 * Page signature: a single-elimination bracket reduced to its essential lines,
 * used oversized and faint behind the hero rather than a generic gradient.
 */
function BracketMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 260" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5">
        <path d="M16 30 H88 V70 H160" />
        <path d="M16 110 H88 V70" />
        <path d="M16 150 H88 V190 H160" />
        <path d="M16 230 H88 V190" />
        <path d="M160 70 H232 V130 H300" />
        <path d="M160 190 H232 V130" />
      </g>
      <circle cx="300" cy="130" r="5" className="fill-accent" />
    </svg>
  );
}

const MARQUEE = [
  'Run the whole bracket',
  'Offline-ready scoring',
  'IBJJF · ADCC · EBI',
  'Single · Double · Round robin',
  'From sign-up to the podium',
];

const STATS = [
  { value: '3', label: 'Bracket formats' },
  { value: '5', label: 'Rulesets scored' },
  { value: '100%', label: 'Offline-capable' },
  { value: '0', label: 'Spreadsheets' },
];

const FEATURES = [
  {
    title: 'Registration & payments',
    body: 'Open divisions, take entries, handle waitlists and weigh-ins, and route fees straight to organizers.',
  },
  {
    title: 'Seeding & brackets',
    body: 'Single elimination, double elimination, and round robin — with academy separation and automatic byes.',
  },
  {
    title: 'Matside scoring',
    body: 'Score IBJJF, ADCC, EBI, and submission-only rulesets on the mat — and keep going when the Wi-Fi drops.',
  },
  {
    title: 'Profiles & academies',
    body: 'Competitor records, academy rosters, and a public directory of events across the world.',
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line/10">
        <BracketMark className="pointer-events-none absolute right-[-60px] top-1/2 hidden w-[760px] -translate-y-1/2 text-line/[0.07] lg:block" />
        <Container size="wide" className="relative py-24 md:py-36">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Tournament software for combat sports
          </p>
          <h1 className="mt-7 max-w-5xl font-display text-6xl font-bold leading-[0.9] tracking-tight sm:text-8xl">
            Run the whole bracket,
            <br />
            from sign-up to the <span className="text-accent">podium.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-muted">
            Registration, seeding, and matside scoring for grappling and combat sports — built to
            keep working when the venue Wi-Fi doesn&apos;t.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/events">Browse events</ButtonLink>
            <ButtonLink href="/academies" variant="secondary">
              Explore academies
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Kinetic ticker */}
      <div className="border-b border-line/10 bg-accent text-white">
        <Marquee items={MARQUEE} />
      </div>

      {/* By the numbers */}
      <section className="border-b border-line/10">
        <Container size="wide" className="grid grid-cols-2 gap-y-10 py-14 md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="md:border-l md:border-line/10 md:pl-6 md:first:border-l-0 md:first:pl-0"
            >
              <div className="font-display text-6xl font-bold tracking-tight tabular-nums sm:text-7xl">
                {stat.value}
              </div>
              <div className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* Numbered stories */}
      <Container size="wide">
        <section className="py-20 md:py-28">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-accent">
            What it does
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl">
            One platform, from the first entry to the final whistle.
          </h2>

          <div className="mt-14 border-t border-line/10">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="grid items-baseline gap-y-3 border-b border-line/10 py-9 md:grid-cols-[110px_minmax(0,1fr)_minmax(0,1.3fr)] md:gap-8"
              >
                <span className="font-display text-5xl font-bold tabular-nums text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-2xl font-bold tracking-tight">{feature.title}</h3>
                <p className="text-muted md:text-lg">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>
      </Container>

      {/* Events rail */}
      <section className="border-t border-line/10 py-20 md:py-28">
        <Container size="wide">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-accent">
                Open now
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Upcoming events
              </h2>
            </div>
            <Link
              href="/events"
              className="text-sm font-bold uppercase tracking-wide text-accent hover:underline"
            >
              View all →
            </Link>
          </div>
        </Container>
        <div className="mt-10">
          <Container size="wide" className="!px-0">
            <FeaturedEvents />
          </Container>
        </div>
      </section>

      {/* Closing statement — inverted band */}
      <section className="bg-chalk text-bg">
        <Container size="wide" className="py-24 text-center md:py-32">
          <h2 className="mx-auto max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
            Built to keep working when the venue Wi-Fi doesn&apos;t.
          </h2>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/events">Find your next event</ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
