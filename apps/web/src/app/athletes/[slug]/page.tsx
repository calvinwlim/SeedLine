'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Container } from '../../../components/ui/container';
import { Avatar } from '../../../components/ui/avatar';
import { Belt } from '../../../components/ui/belt';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/card';
import { ButtonLink } from '../../../components/ui/button';
import { RegistrationList } from '../../../components/registration-list';
import { MedalList } from '../../../components/medal-list';
import { WinRateRing } from '../../../components/stats/win-rate-ring';
import { StatTile } from '../../../components/stats/stat-tile';
import { MedalShelf } from '../../../components/stats/medal-shelf';
import { AchievementGrid } from '../../../components/stats/achievement-grid';
import { api } from '../../../lib/api';
import { deriveAchievements, deriveKeyStats, deriveMedals } from '../../../lib/gamify';
import { fullName, humanize, initials } from '../../../lib/format';

export default function AthleteProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: athlete, isLoading } = useQuery({
    queryKey: ['athlete', slug],
    queryFn: () => api.getAthlete(slug),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="h-40 animate-pulse rounded-xl border border-line/10 bg-surface" />
      </Container>
    );
  }

  if (!athlete) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Athlete not found"
          action={<ButtonLink href="/athletes">Back to athletes</ButtonLink>}
        />
      </Container>
    );
  }

  const stats = deriveKeyStats(athlete.record);
  const medals = deriveMedals(athlete.record, athlete.achievements);
  const achievements = deriveAchievements({
    record: athlete.record,
    achievements: athlete.achievements,
    isBlackBelt: athlete.beltRank === 'black',
  });

  return (
    <main>
      <div className="border-b border-line/10 bg-surface">
        <Container className="py-10">
          <Link href="/athletes" className="text-sm text-muted hover:text-chalk">
            ← All athletes
          </Link>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <Avatar initials={initials(athlete.firstName, athlete.lastName)} size="lg" />
              <div>
                <h1 className="font-display text-3xl font-bold sm:text-4xl">
                  {fullName(athlete.firstName, athlete.lastName)}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <Belt rank={athlete.beltRank} />
                  <Badge tone="outline">{humanize(athlete.discipline)}</Badge>
                  {athlete.weightClass && <Badge tone="muted">{athlete.weightClass}</Badge>}
                </div>
                <p className="mt-3 text-sm text-muted">
                  {athlete.academySlug ? (
                    <Link href={`/academies/${athlete.academySlug}`} className="hover:text-chalk">
                      {athlete.academyName}
                    </Link>
                  ) : (
                    'Unaffiliated'
                  )}
                  {athlete.country ? ` · ${athlete.country}` : ''}
                </p>
                <p className="mt-3 text-sm text-muted">
                  <span className="font-display text-base font-bold text-podium">
                    {athlete.record.wins}–{athlete.record.losses}
                  </span>{' '}
                  record · {athlete.record.submissions} submissions ·{' '}
                  <span className="text-chalk">{medals.gold}</span> gold
                </p>
              </div>
            </div>

            <div className="shrink-0 self-center lg:self-auto">
              <WinRateRing
                value={stats.winRate}
                sub={`${athlete.record.wins} of ${stats.matches}`}
              />
            </div>
          </div>
        </Container>
      </div>

      <Container className="space-y-10 py-10">
        {athlete.bio && <p className="max-w-2xl text-muted">{athlete.bio}</p>}

        <section>
          <h2 className="mb-3 font-display text-xl font-bold">Record</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile label="Matches" value={stats.matches} />
            <StatTile label="Wins" value={stats.wins} accent="win" />
            <StatTile label="Losses" value={stats.losses} accent="corner" />
            <StatTile label="Submissions" value={stats.submissions} accent="win" />
            <StatTile label="Sub finishes" value={stats.finishRate} suffix="%" accent="gold" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-bold">Trophy shelf</h2>
          <MedalShelf medals={medals} />
        </section>

        <section>
          <AchievementGrid achievements={achievements} />
        </section>

        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 font-display text-xl font-bold">Competition history</h2>
            <RegistrationList registrations={athlete.registrations} />
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold">Podium results</h2>
            <MedalList medals={athlete.achievements} />
          </section>
        </div>
      </Container>
    </main>
  );
}
