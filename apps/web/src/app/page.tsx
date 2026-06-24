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
      <g stroke="currentColor" strokeWidth="1.5" className="text-line/15">
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

type FeatureIconName = 'register' | 'bracket' | 'score' | 'profile';

function FeatureIcon({ name }: { name: FeatureIconName }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'register':
      return (
        <svg {...common}>
          <path d="M9 5h6a1 1 0 0 1 1 1v0a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v0a1 1 0 0 1 1-1z" />
          <path d="M16 5h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
          <path d="M9 13l2 2 4-4" />
        </svg>
      );
    case 'bracket':
      return (
        <svg {...common}>
          <path d="M4 6h5v5h6M4 18h5v-5" />
          <path d="M15 11h5M15 11l-2-2M15 11l-2 2" />
        </svg>
      );
    case 'score':
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="7" />
          <path d="M12 13V9M12 4h0M10 4h4M18.5 6.5l-1.4 1.4" />
        </svg>
      );
    case 'profile':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M6 20c0-3 2.7-5 6-5s6 2 6 5" />
        </svg>
      );
  }
}

const FEATURES: Array<{ icon: FeatureIconName; title: string; body: string }> = [
  {
    icon: 'register',
    title: 'Registration & payments',
    body: 'Open divisions, take entries, handle waitlists and weigh-ins, and route fees to organizers.',
  },
  {
    icon: 'bracket',
    title: 'Seeding & brackets',
    body: 'Single elimination, round robin, and double elimination with academy separation and automatic byes.',
  },
  {
    icon: 'score',
    title: 'Matside scoring',
    body: 'Score IBJJF, ADCC, EBI, and submission-only rulesets on the mat — and keep going when the Wi-Fi drops.',
  },
  {
    icon: 'profile',
    title: 'Profiles & academies',
    body: 'Competitor records, academy rosters, and a public directory of events across the world.',
  },
];

const HERO_HIGHLIGHTS = ['3 bracket formats', 'Offline-ready scoring', 'Global event directory'];

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
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {HERO_HIGHLIGHTS.map((item) => (
                <span key={item} className="flex items-center gap-2 text-sm text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-podium" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden h-64 rounded-2xl border border-line/10 bg-surface p-6 shadow-card md:block">
            <BracketMark />
          </div>
        </section>
      </Container>

      <Container size="wide">
        <section className="grid gap-4 border-t border-line/10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-line/10 bg-surface p-5 shadow-card transition-transform hover:-translate-y-0.5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-podium/15 text-podium">
                <FeatureIcon name={feature.icon} />
              </span>
              <h3 className="mt-4 font-display text-base font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted">{feature.body}</p>
            </div>
          ))}
        </section>
      </Container>

      <Container size="wide">
        <section className="border-t border-line/10 py-14">
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
