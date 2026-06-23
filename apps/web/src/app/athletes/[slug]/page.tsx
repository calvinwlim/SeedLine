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
import { RecordStats } from '../../../components/record-stats';
import { RegistrationList } from '../../../components/registration-list';
import { MedalList } from '../../../components/medal-list';
import { api } from '../../../lib/api';
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
        <div className="h-28 animate-pulse rounded-lg border border-white/10 bg-surface" />
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

  return (
    <main>
      <div className="border-b border-white/10 bg-surface/40">
        <Container className="py-10">
          <Link href="/athletes" className="text-sm text-muted hover:text-chalk">
            ← All athletes
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-5">
            <Avatar initials={initials(athlete.firstName, athlete.lastName)} size="lg" />
            <div>
              <h1 className="font-display text-3xl font-bold">
                {fullName(athlete.firstName, athlete.lastName)}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Belt rank={athlete.beltRank} />
                <Badge tone="outline">{humanize(athlete.discipline)}</Badge>
                {athlete.weightClass && <Badge tone="muted">{athlete.weightClass}</Badge>}
              </div>
              <p className="mt-2 text-sm text-muted">
                {athlete.academySlug ? (
                  <Link href={`/academies/${athlete.academySlug}`} className="hover:text-chalk">
                    {athlete.academyName}
                  </Link>
                ) : (
                  'Unaffiliated'
                )}
                {athlete.country ? ` · ${athlete.country}` : ''}
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="space-y-10 py-10">
        {athlete.bio && <p className="max-w-2xl text-muted">{athlete.bio}</p>}

        <section>
          <h2 className="font-display text-xl font-bold">Record</h2>
          <div className="mt-4">
            <RecordStats record={athlete.record} />
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="font-display text-xl font-bold">Competition history</h2>
            <div className="mt-4">
              <RegistrationList registrations={athlete.registrations} />
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Achievements</h2>
            <div className="mt-4">
              <MedalList medals={athlete.achievements} />
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
