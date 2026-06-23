'use client';

import { ButtonLink } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/card';
import { RegistrationList } from '../../../components/registration-list';
import { useAccount } from '../../../lib/use-account';

export default function AccountRegistrationsPage() {
  const { data: account, isLoading } = useAccount();

  if (isLoading || !account) {
    return <div className="h-40 animate-pulse rounded-lg border border-line/10 bg-surface" />;
  }

  const registrations = account.athlete?.registrations ?? [];
  const now = new Date();
  const upcoming = registrations.filter((r) => new Date(r.startDate) >= now);
  const past = registrations.filter((r) => new Date(r.startDate) < now);

  if (registrations.length === 0) {
    return (
      <EmptyState
        title="No registrations yet"
        description="When you register for an event, it will show up here."
        action={<ButtonLink href="/events">Browse events</ButtonLink>}
      />
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-lg font-bold">Upcoming</h2>
        <div className="mt-4">
          <RegistrationList registrations={upcoming} />
        </div>
      </section>
      {past.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold">Past</h2>
          <div className="mt-4">
            <RegistrationList registrations={past} />
          </div>
        </section>
      )}
    </div>
  );
}
