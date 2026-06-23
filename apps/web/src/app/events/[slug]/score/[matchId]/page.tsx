'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CompetitorScore, MatchScore, ScoreSide, ScoreableMatch } from '@openmat/types';
import { Container } from '../../../../../components/ui/container';
import { Badge } from '../../../../../components/ui/badge';
import { Button, ButtonLink } from '../../../../../components/ui/button';
import { Card, EmptyState } from '../../../../../components/ui/card';
import { AuthGate } from '../../../../../components/auth/auth-gate';
import { api } from '../../../../../lib/api';
import { cn } from '../../../../../lib/cn';

/** Decide the winner from a points score; advantages then fewer penalties break ties. */
function decideWinner(score: MatchScore): ScoreSide {
  if (score.a.points !== score.b.points) return score.a.points > score.b.points ? 'a' : 'b';
  if (score.a.advantages !== score.b.advantages)
    return score.a.advantages > score.b.advantages ? 'a' : 'b';
  if (score.a.penalties !== score.b.penalties)
    return score.a.penalties < score.b.penalties ? 'a' : 'b';
  return 'a';
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const tallyBtn =
  'rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-chalk transition-colors hover:border-podium hover:text-podium disabled:opacity-40';

function ScorePanel({
  side,
  name,
  score,
  disabled,
  onChange,
  onSubmission,
  highlight,
}: {
  side: ScoreSide;
  name: string;
  score: CompetitorScore;
  disabled: boolean;
  onChange: (field: keyof CompetitorScore, delta: number) => void;
  onSubmission: () => void;
  highlight: boolean;
}) {
  return (
    <Card className={cn('p-5', highlight && 'ring-2 ring-podium')}>
      <div className="flex items-center justify-between">
        <h2 className="truncate font-display text-lg font-bold">{name}</h2>
        <span className="text-xs uppercase tracking-wide text-muted">
          {side === 'a' ? 'Side A' : 'Side B'}
        </span>
      </div>

      <div className="mt-3 text-center">
        <div className="font-display text-7xl font-bold tabular-nums">{score.points}</div>
        <div className="text-xs uppercase tracking-wide text-muted">points</div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {[2, 3, 4].map((v) => (
          <button
            key={v}
            type="button"
            disabled={disabled}
            onClick={() => onChange('points', v)}
            className={tallyBtn}
          >
            +{v}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('points', -1)}
          className={tallyBtn}
        >
          −1
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-md border border-white/10 p-3">
          <div className="font-display text-2xl font-bold tabular-nums">{score.advantages}</div>
          <div className="text-[11px] uppercase tracking-wide text-muted">advantages</div>
          <div className="mt-2 flex justify-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange('advantages', 1)}
              className={tallyBtn}
            >
              +
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange('advantages', -1)}
              className={tallyBtn}
            >
              −
            </button>
          </div>
        </div>
        <div className="rounded-md border border-white/10 p-3">
          <div className="font-display text-2xl font-bold tabular-nums text-corner">
            {score.penalties}
          </div>
          <div className="text-[11px] uppercase tracking-wide text-muted">penalties</div>
          <div className="mt-2 flex justify-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange('penalties', 1)}
              className={tallyBtn}
            >
              +
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange('penalties', -1)}
              className={tallyBtn}
            >
              −
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onSubmission}
        className="mt-4 w-full rounded-md bg-corner/15 py-2 text-sm font-semibold text-corner ring-1 ring-inset ring-corner/30 transition-colors hover:bg-corner/25 disabled:opacity-40"
      >
        Submission win
      </button>
    </Card>
  );
}

function ScoreConsole() {
  const params = useParams<{ slug: string; matchId: string }>();
  const { slug, matchId } = params;
  const queryClient = useQueryClient();
  const queryKey = ['score-match', slug, matchId];

  const { data: match, isLoading } = useQuery({
    queryKey,
    queryFn: () => api.getScoreableMatch(slug, matchId),
    enabled: Boolean(slug && matchId),
  });

  // Local match clock (display only).
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  function set(updated: ScoreableMatch | null) {
    if (updated) queryClient.setQueryData(queryKey, updated);
  }

  async function change(side: ScoreSide, field: keyof CompetitorScore, delta: number) {
    set(await api.applyScore(slug, matchId, { side, field, delta }));
  }

  async function start() {
    set(await api.startMatch(slug, matchId));
    setRunning(true);
  }

  async function finishByPoints() {
    if (!match) return;
    setRunning(false);
    set(await api.finishMatch(slug, matchId, decideWinner(match.score), 'points'));
    invalidateBoards();
  }

  async function finishBySubmission(side: ScoreSide) {
    setRunning(false);
    set(await api.finishMatch(slug, matchId, side, 'submission'));
    invalidateBoards();
  }

  async function reset() {
    set(await api.resetMatch(slug, matchId));
    setSeconds(0);
    setRunning(false);
  }

  function invalidateBoards() {
    queryClient.invalidateQueries({ queryKey: ['schedule', slug] });
    queryClient.invalidateQueries({ queryKey: ['mat-controls', slug] });
  }

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="h-96 animate-pulse rounded-lg border border-white/10 bg-surface" />
      </Container>
    );
  }

  if (!match) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Match not found"
          action={<ButtonLink href={`/events/${slug}/control`}>Back to mat control</ButtonLink>}
        />
      </Container>
    );
  }

  const done = match.status === 'completed';
  const live = match.status === 'in_progress';
  const winnerSide = done ? (match.winner === match.competitorA ? 'a' : 'b') : null;

  return (
    <Container size="narrow" className="py-8">
      <div className="flex items-center justify-between">
        <Link href={`/events/${slug}/control`} className="text-sm text-muted hover:text-chalk">
          ← Mat control
        </Link>
        <Badge tone={live ? 'gold' : done ? 'muted' : 'outline'}>
          {match.matName} · {match.status === 'in_progress' ? 'Live' : match.status}
        </Badge>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted">
          {match.divisionName} · {match.roundLabel}
        </p>
        <div className="mt-2 font-display text-5xl font-bold tabular-nums">
          {formatClock(seconds)}
        </div>
        <div className="mt-2 flex justify-center gap-2">
          {!running ? (
            <Button size="sm" variant="secondary" onClick={() => setRunning(true)} disabled={done}>
              Start clock
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setRunning(false)}>
              Pause
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSeconds(0);
              setRunning(false);
            }}
          >
            Reset clock
          </Button>
        </div>
      </div>

      {done && (
        <div className="mt-6 rounded-lg border border-podium/40 bg-podium/10 p-4 text-center">
          <p className="text-sm text-muted">Winner</p>
          <p className="font-display text-xl font-bold text-podium">{match.winner}</p>
          <p className="mt-1 text-xs text-muted">by {match.score.method}</p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ScorePanel
          side="a"
          name={match.competitorA}
          score={match.score.a}
          disabled={done}
          highlight={winnerSide === 'a'}
          onChange={(field, delta) => change('a', field, delta)}
          onSubmission={() => finishBySubmission('a')}
        />
        <ScorePanel
          side="b"
          name={match.competitorB}
          score={match.score.b}
          disabled={done}
          highlight={winnerSide === 'b'}
          onChange={(field, delta) => change('b', field, delta)}
          onSubmission={() => finishBySubmission('b')}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={reset}>
          Reset match
        </Button>
        <div className="flex gap-3">
          {!live && !done && <Button onClick={start}>Start match</Button>}
          {!done && (
            <Button onClick={finishByPoints} disabled={!live}>
              Finish on points
            </Button>
          )}
          {done && <ButtonLink href={`/events/${slug}/control`}>Score next match</ButtonLink>}
        </div>
      </div>
    </Container>
  );
}

export default function ScoreConsolePage() {
  return (
    <AuthGate roles={['organizer', 'staff', 'admin']}>
      <ScoreConsole />
    </AuthGate>
  );
}
