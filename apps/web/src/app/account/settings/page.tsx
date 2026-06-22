'use client';

import { Card, CardBody } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useAccount } from '../../../lib/use-account';
import { dataSource } from '../../../lib/api';
import { formatDate, humanize } from '../../../lib/format';

function ToggleRow({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-chalk">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <span className="inline-flex h-6 w-11 items-center rounded-full bg-podium/80 px-0.5">
        <span className="h-5 w-5 translate-x-5 rounded-full bg-ink transition-transform" />
      </span>
    </div>
  );
}

export default function AccountSettingsPage() {
  const { data: account, isLoading } = useAccount();

  if (isLoading || !account) {
    return <div className="h-64 animate-pulse rounded-lg border border-white/10 bg-surface" />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardBody>
          <h2 className="font-display text-lg font-bold">Account</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Email</span>
              <span className="text-chalk">{account.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Role</span>
              <span className="text-chalk">{humanize(account.role)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Member since</span>
              <span className="text-chalk">{formatDate(account.memberSince)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Data source</span>
              <Badge tone={dataSource === 'live' ? 'green' : 'gold'}>
                {dataSource === 'live' ? 'Live API' : 'Mock (standalone)'}
              </Badge>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="font-display text-lg font-bold">Notifications</h2>
          <div className="mt-2 divide-y divide-white/5">
            <ToggleRow
              label="Event reminders"
              description="Get an email before events you've registered for."
            />
            <ToggleRow
              label="Bracket updates"
              description="Be notified when your division's bracket is posted."
            />
            <ToggleRow
              label="Results"
              description="Receive a summary of your results after each event."
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-corner">Danger zone</h2>
            <p className="text-xs text-muted">Permanently delete your account and data.</p>
          </div>
          <Button variant="secondary" disabled>
            Delete account
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
