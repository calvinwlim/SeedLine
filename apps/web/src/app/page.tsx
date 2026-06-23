import Link from 'next/link';
import { ButtonLink } from '../components/ui/button';
import { Container } from '../components/ui/container';
import { FeaturedEvents } from '../components/featured-events';

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

const FEATURES = [
  {
    title: 'Registration & payments',
    body: 'Open divisions, take entries, handle waitlists and weigh-ins, and route fees to organizers.',
  },
  {
    title: 'Seeding & brackets',
    body: 'Single elimination, round robin, and double elimination with academy separation and automatic byes.',
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
      <Container size="wide">
        <section className="grid items-center gap-10 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
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
              <ButtonLink href="/events">Browse events</ButtonLink>
              <ButtonLink href="/academies" variant="secondary">
                Explore academies
              </ButtonLink>
            </div>
          </div>

          <div className="hidden h-64 md:block">
            <BracketMark />
          </div>
        </section>
      </Container>

      <Container size="wide">
        <section className="grid gap-4 border-t border-white/10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <h3 className="font-display text-base font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted">{feature.body}</p>
            </div>
          ))}
        </section>
      </Container>

      <Container size="wide">
        <section className="border-t border-white/10 py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">Upcoming events</h2>
              <p className="mt-1 text-muted">Open for registration now.</p>
            </div>
            <Link href="/events" className="text-sm text-podium hover:underline">
              View all events →
            </Link>
          </div>
          <div className="mt-8">
            <FeaturedEvents />
          </div>
        </section>
      </Container>
    </main>
  );
}
