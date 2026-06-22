'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { ScheduleMatch } from '@openmat/types';
import { Container } from '../../../../components/ui/container';
import { Badge } from '../../../../components/ui/badge';
import { ButtonLink } from '../../../../components/ui/button';
import { Card, EmptyState } from '../../../../components/ui/card';
import { api } from '../../../../lib/api';
import { eventStatusLabel, eventStatusTone } from '../../../../lib/format';

function MatchRow({ match }: { match: ScheduleMatch }) {
  const live = match.status === 'in_progress';
  const ready = match.status === 'ready';
  const done = match.status === 'completed';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${live ? 'bg-podium/5' : ''}`}>
      <span className="w-5 shrink-0 text-center text-xs text-muted">{match.order}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={
              done && match.winner === match.competitorA ? 'font-medium text-chalk' : 'text-muted'
            }
          >
            {match.competitorA ?? 'TBD'}
          </span>
          <span className="text-xs text-muted">vs</span>
          <span
            className={
              done && match.winner === match.competitorB ? 'font-medium text-chalk' : 'text-muted'
            }
          >
            {match.competitorB ?? 'TBD'}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">
          {match.divisionName} · {match.roundLabel}
        </p>
      </div>
      <div className="shrink-0">
        {live && <Badge tone="gold">On the mat</Badge>}
        {ready && <Badge tone="outline">On deck</Badge>}
        {done && <Badge tone="muted">Done</Badge>}
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule', slug],
    queryFn: () => api.getEventSchedule(slug),
    enabled: Boolean(slug),
    // Refetch periodically so an in-progress board feels live.
    refetchInterval: 15_000,
  });

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="h-64 animate-pulse rounded-lg border border-white/10 bg-surface" />
      </Container>
    );
  }

  if (!schedule) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Schedule not available"
          action={<ButtonLink href="/events">Back to events</ButtonLink>}
        />
      </Container>
    );
  }

  const progress =
    schedule.totalMatches > 0
      ? Math.round((schedule.completedMatches / schedule.totalMatches) * 100)
      : 0;

  return (
    <main>
      <div className="border-b border-white/10 bg-surface/40">
        <Container className="py-10">
          <Link
            href={`/events/${schedule.eventSlug}`}
            className="text-sm text-muted hover:text-chalk"
          >
            ← {schedule.eventName}
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">Schedule &amp; results</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge tone={eventStatusTone(schedule.status)}>
                  {eventStatusLabel(schedule.status)}
                </Badge>
                {schedule.status === 'in_progress' && (
                  <span className="flex items-center gap-1.5 text-sm text-podium">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-podium" />
                    Live
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold">
                {schedule.completedMatches}
                <span className="text-muted">/{schedule.totalMatches}</span>
              </p>
              <p className="text-xs uppercase tracking-wide text-muted">matches complete</p>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-podium" style={{ width: `${progress}%` }} />
          </div>
        </Container>
      </div>

      <Container className="py-10">
        {schedule.mats.length === 0 ? (
          <EmptyState
            title="No matches scheduled yet"
            description="Once divisions have entrants, the running order appears here, split across mats."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {schedule.mats.map((mat) => (
              <div key={mat.name}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">{mat.name}</h2>
                  <span className="text-xs text-muted">{mat.matches.length} bouts</span>
                </div>
                <Card className="divide-y divide-white/10">
                  {mat.matches.map((match) => (
                    <MatchRow key={match.id} match={match} />
                  ))}
                </Card>
              </div>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
