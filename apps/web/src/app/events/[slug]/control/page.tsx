'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { MatControl, ScoreableMatch } from '@openmat/types';
import { Container } from '../../../../components/ui/container';
import { ButtonLink } from '../../../../components/ui/button';
import { Card, CardBody, EmptyState } from '../../../../components/ui/card';
import { AuthGate } from '../../../../components/auth/auth-gate';
import { api } from '../../../../lib/api';

const STAFF_ROLES = ['organizer', 'staff', 'admin'] as const;

function ScoreLine({ match }: { match: ScoreableMatch }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="truncate text-chalk">{match.competitorA}</span>
      <span className="shrink-0 font-display font-bold tabular-nums text-podium">
        {match.score.a.points}–{match.score.b.points}
      </span>
      <span className="truncate text-right text-chalk">{match.competitorB}</span>
    </div>
  );
}

function MatCard({ mat, slug }: { mat: MatControl; slug: string }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{mat.name}</h2>
          <span className="text-xs text-muted">
            {mat.completed} done · {mat.remaining} left
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-muted">On the mat</p>
          {mat.current ? (
            <div className="mt-2 rounded-md border border-podium/30 bg-podium/5 p-3">
              <p className="mb-2 truncate text-xs text-muted">
                {mat.current.divisionName} · {mat.current.roundLabel}
              </p>
              <ScoreLine match={mat.current} />
              <ButtonLink
                href={`/events/${slug}/score/${mat.current.id}`}
                size="sm"
                className="mt-3 w-full"
              >
                Open scoreboard
              </ButtonLink>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">No match in progress.</p>
          )}
        </div>

        {mat.onDeck && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-muted">On deck</p>
            <div className="mt-2 rounded-md border border-white/10 p-3">
              <p className="mb-2 truncate text-xs text-muted">
                {mat.onDeck.divisionName} · {mat.onDeck.roundLabel}
              </p>
              <ScoreLine match={mat.onDeck} />
              <ButtonLink
                href={`/events/${slug}/score/${mat.onDeck.id}`}
                size="sm"
                variant="secondary"
                className="mt-3 w-full"
              >
                Score this match
              </ButtonLink>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default function MatControlPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: mats, isLoading } = useQuery({
    queryKey: ['mat-controls', slug],
    queryFn: () => api.getMatControls(slug),
    enabled: Boolean(slug),
    refetchInterval: 10_000,
  });

  return (
    <AuthGate roles={[...STAFF_ROLES]}>
      <main>
        <div className="border-b border-white/10 bg-surface/40">
          <Container className="py-10">
            <Link href={`/events/${slug}/schedule`} className="text-sm text-muted hover:text-chalk">
              ← Schedule
            </Link>
            <h1 className="mt-3 font-display text-3xl font-bold">Mat control</h1>
            <p className="mt-2 text-muted">
              Staff view — open a scoreboard to run a match. Results flow to the live board.
            </p>
          </Container>
        </div>

        <Container className="py-10">
          {isLoading && (
            <div className="grid gap-5 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-lg border border-white/10 bg-surface"
                />
              ))}
            </div>
          )}

          {mats && mats.length === 0 && (
            <EmptyState
              title="No mats running"
              description="Once the event has scheduled matches, mats appear here."
            />
          )}

          {mats && mats.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              {mats.map((mat) => (
                <MatCard key={mat.name} mat={mat} slug={slug} />
              ))}
            </div>
          )}
        </Container>
      </main>
    </AuthGate>
  );
}
