import type { Bracket, BracketMatch } from '@openmat/bracket-engine';
import { computeRoundRobinStandings } from '@openmat/bracket-engine';
import { cn } from '../../lib/cn';

function nameMap(bracket: Bracket): Map<string, { name: string; seed: number }> {
  return new Map(
    bracket.entrants.map((e, i) => [e.id, { name: e.name ?? e.id, seed: e.seed ?? i + 1 }]),
  );
}

function roundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinals';
  if (fromEnd === 2) return 'Quarterfinals';
  return `Round ${round}`;
}

function Slot({
  entrantId,
  isBye,
  isWinner,
  names,
}: {
  entrantId: string | null;
  isBye: boolean;
  isWinner: boolean;
  names: Map<string, { name: string; seed: number }>;
}) {
  const info = entrantId ? names.get(entrantId) : undefined;
  const label = info?.name ?? (isBye ? 'Bye' : '—');
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 px-3 py-1.5 text-sm',
        isWinner ? 'text-chalk' : 'text-muted',
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        {info && (
          <span className="w-4 shrink-0 text-right text-[10px] text-muted">{info.seed}</span>
        )}
        <span className="truncate">{label}</span>
      </span>
      {isWinner && <span className="shrink-0 text-podium">✓</span>}
    </div>
  );
}

function MatchBox({
  match,
  names,
}: {
  match: BracketMatch;
  names: Map<string, { name: string; seed: number }>;
}) {
  return (
    <div className="w-52 overflow-hidden rounded-md border border-white/10 bg-surface">
      <Slot
        entrantId={match.entrantA}
        isBye={match.sideA.kind === 'bye'}
        isWinner={!!match.winnerId && match.winnerId === match.entrantA}
        names={names}
      />
      <div className="border-t border-white/10" />
      <Slot
        entrantId={match.entrantB}
        isBye={match.sideB.kind === 'bye'}
        isWinner={!!match.winnerId && match.winnerId === match.entrantB}
        names={names}
      />
    </div>
  );
}

function SingleElimination({ bracket }: { bracket: Bracket }) {
  const names = nameMap(bracket);
  const rounds = Array.from({ length: bracket.rounds }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-6">
        {rounds.map((round) => {
          const matches = bracket.matches
            .filter((m) => m.round === round)
            .sort((a, b) => a.position - b.position);
          return (
            <div key={round} className="flex flex-col">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                {roundLabel(round, bracket.rounds)}
              </p>
              <div className="flex flex-1 flex-col justify-around gap-4">
                {matches.map((match) => (
                  <MatchBox key={match.id} match={match} names={names} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoundRobin({ bracket }: { bracket: Bracket }) {
  const names = nameMap(bracket);
  const standings = computeRoundRobinStandings(bracket);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Standings</h3>
        <div className="overflow-hidden rounded-md border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Competitor</th>
                <th className="px-3 py-2 text-center font-medium">W</th>
                <th className="px-3 py-2 text-center font-medium">L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {standings.map((s, i) => (
                <tr key={s.entrantId} className={i === 0 ? 'text-chalk' : 'text-muted'}>
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{names.get(s.entrantId)?.name ?? s.entrantId}</td>
                  <td className="px-3 py-2 text-center">{s.wins}</td>
                  <td className="px-3 py-2 text-center">{s.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Matches</h3>
        <div className="space-y-2">
          {bracket.matches.map((match) => {
            const a = match.entrantA ? names.get(match.entrantA)?.name : '—';
            const b = match.entrantB ? names.get(match.entrantB)?.name : '—';
            return (
              <div
                key={match.id}
                className="flex items-center justify-between rounded-md border border-white/10 bg-surface px-3 py-2 text-sm"
              >
                <span className={match.winnerId === match.entrantA ? 'text-chalk' : 'text-muted'}>
                  {a}
                </span>
                <span className="px-2 text-xs text-muted">vs</span>
                <span className={match.winnerId === match.entrantB ? 'text-chalk' : 'text-muted'}>
                  {b}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function BracketView({ bracket }: { bracket: Bracket }) {
  if (bracket.matches.length === 0) {
    return <p className="text-sm text-muted">Not enough entrants to generate a bracket yet.</p>;
  }
  if (bracket.format === 'round_robin') {
    return <RoundRobin bracket={bracket} />;
  }
  return <SingleElimination bracket={bracket} />;
}
