'use client';

import Link from 'next/link';
import { Avatar } from '../../components/ui/avatar';
import { Belt } from '../../components/ui/belt';
import { Card, CardBody, Stat } from '../../components/ui/card';
import { ButtonLink } from '../../components/ui/button';
import { RegistrationList } from '../../components/registration-list';
import { useAccount } from '../../lib/use-account';
import { initials } from '../../lib/format';

export default function AccountDashboardPage() {
  const { data: account, isLoading } = useAccount();

  if (isLoading || !account) {
    return <div className="h-40 animate-pulse rounded-lg border border-white/10 bg-surface" />;
  }

  const athlete = account.athlete;
  const upcoming = (athlete?.registrations ?? []).filter(
    (r) => r.status !== 'withdrawn' && new Date(r.startDate) >= new Date(),
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              initials={
                athlete
                  ? initials(athlete.firstName, athlete.lastName)
                  : account.name.charAt(0).toUpperCase()
              }
              size="lg"
            />
            <div>
              <p className="font-display text-xl font-bold">{account.name}</p>
              <p className="text-sm text-muted">{account.email}</p>
              {athlete && (
                <div className="mt-2">
                  <Belt rank={athlete.beltRank} />
                </div>
              )}
            </div>
          </div>
          {athlete && (
            <ButtonLink href={`/athletes/${athlete.slug}`} variant="secondary">
              View public profile
            </ButtonLink>
          )}
        </CardBody>
      </Card>

      {athlete && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Registrations" value={athlete.registrations.length} />
          <Stat label="Wins" value={athlete.record.wins} />
          <Stat label="Submissions" value={athlete.record.submissions} />
          <Stat label="Gold medals" value={athlete.record.goldMedals} />
        </div>
      )}

      <section>
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-bold">Upcoming events</h2>
          <Link href="/account/registrations" className="text-sm text-podium hover:underline">
            All registrations →
          </Link>
        </div>
        <div className="mt-4">
          {upcoming.length > 0 ? (
            <RegistrationList registrations={upcoming} />
          ) : (
            <Card>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">
                  No upcoming events. Find your next competition.
                </p>
                <ButtonLink href="/events" size="sm">
                  Browse events
                </ButtonLink>
              </CardBody>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
