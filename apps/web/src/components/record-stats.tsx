import type { AthleteRecord } from '@seedline/types';
import { Stat } from './ui/card';

/** The win/loss/finish summary shown on competitor profiles. */
export function RecordStats({ record }: { record: AthleteRecord }) {
  const winRate = record.matches > 0 ? Math.round((record.wins / record.matches) * 100) : 0;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Stat label="Matches" value={record.matches} />
      <Stat label="Wins" value={record.wins} />
      <Stat label="Losses" value={record.losses} />
      <Stat label="Submissions" value={record.submissions} />
      <Stat label="Gold" value={record.goldMedals} />
      <Stat label="Win rate" value={`${winRate}%`} />
    </div>
  );
}
