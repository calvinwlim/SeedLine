'use client';

import { useEffect, useState } from 'react';
import { BELT_RANKS, type BeltRank } from '@openmat/types';
import { Card, CardBody } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Belt } from '../../../components/ui/belt';
import { useAccount } from '../../../lib/use-account';
import { humanize } from '../../../lib/format';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  'w-full rounded-md border border-line/10 bg-bg px-3 py-2.5 text-sm text-chalk placeholder:text-muted focus:border-accent/50 focus:outline-none';

export default function AccountProfilePage() {
  const { data: account, isLoading } = useAccount();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [belt, setBelt] = useState<BeltRank>('white');
  const [weightClass, setWeightClass] = useState('');
  const [bio, setBio] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!account?.athlete) return;
    const a = account.athlete;
    setFirstName(a.firstName);
    setLastName(a.lastName);
    setBelt(a.beltRank);
    setWeightClass(a.weightClass ?? '');
    setBio(a.bio ?? '');
  }, [account]);

  if (isLoading || !account) {
    return <div className="h-64 animate-pulse rounded-lg border border-line/10 bg-surface" />;
  }

  return (
    <form
      className="max-w-2xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
    >
      <Card>
        <CardBody className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="First name">
              <input
                className={inputClass}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Field>
            <Field label="Last name">
              <input
                className={inputClass}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Belt rank">
              <select
                className={inputClass}
                value={belt}
                onChange={(e) => setBelt(e.target.value as BeltRank)}
              >
                {BELT_RANKS.map((b) => (
                  <option key={b} value={b} className="bg-surface">
                    {humanize(b)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Weight class">
              <input
                className={inputClass}
                value={weightClass}
                onChange={(e) => setWeightClass(e.target.value)}
                placeholder="e.g. Featherweight (70kg)"
              />
            </Field>
          </div>

          <Field label="Bio">
            <textarea
              className={inputClass}
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell event organizers about your background."
            />
          </Field>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">Preview:</span>
            <Belt rank={belt} />
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit">Save changes</Button>
        {saved && (
          <span className="text-sm text-win">
            Saved locally. Wiring to the API is the next step.
          </span>
        )}
      </div>
    </form>
  );
}
