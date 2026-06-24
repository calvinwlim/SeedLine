'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BELT_RANKS, type BeltRank, type DivisionSummary } from '@openmat/types';
import { Container } from '../../../../components/ui/container';
import { Card, CardBody, EmptyState } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button, ButtonLink } from '../../../../components/ui/button';
import { api } from '../../../../lib/api';
import { useAccount } from '../../../../lib/use-account';
import { cn } from '../../../../lib/cn';
import { formatPrice, humanize } from '../../../../lib/format';

const STEPS = ['Division', 'Competitor', 'Review'] as const;
const SERVICE_FEE_RATE = 0.05;

const inputClass =
  'w-full rounded-md border border-line/10 bg-bg px-3 py-2.5 text-sm text-chalk placeholder:text-muted focus:border-podium/50 focus:outline-none';

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const state = i < step ? 'done' : i === step ? 'active' : 'todo';
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                state === 'active' && 'bg-podium text-ink',
                state === 'done' && 'bg-win/15 text-win ring-1 ring-inset ring-win/30',
                state === 'todo' && 'bg-line/5 text-muted',
              )}
            >
              {state === 'done' ? '✓' : i + 1}
            </span>
            <span className={cn('text-sm', state === 'todo' ? 'text-muted' : 'text-chalk')}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-line/10" />}
          </li>
        );
      })}
    </ol>
  );
}

function RegisterFlow() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => api.getEvent(slug),
    enabled: Boolean(slug),
  });
  const { data: account } = useAccount();

  const [step, setStep] = useState(0);
  const [divisionId, setDivisionId] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [belt, setBelt] = useState<BeltRank>('white');
  const [academyName, setAcademyName] = useState('');
  const [weightClass, setWeightClass] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Preselect the division from the query string, if present.
  useEffect(() => {
    const fromQuery = searchParams.get('division');
    if (fromQuery) setDivisionId(fromQuery);
  }, [searchParams]);

  // Prefill competitor details from the signed-in athlete.
  useEffect(() => {
    const a = account?.athlete;
    if (!a) return;
    setFirstName(a.firstName);
    setLastName(a.lastName);
    setBelt(a.beltRank);
    setAcademyName(a.academyName ?? '');
    setWeightClass(a.weightClass ?? '');
  }, [account]);

  const division: DivisionSummary | undefined = useMemo(
    () => event?.divisions.find((d) => d.id === divisionId),
    [event, divisionId],
  );

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="h-64 animate-pulse rounded-lg border border-line/10 bg-surface" />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Event not found"
          action={<ButtonLink href="/events">Back to events</ButtonLink>}
        />
      </Container>
    );
  }

  if (done && division) {
    return (
      <Container size="narrow" className="py-16">
        <Card>
          <CardBody className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-win/15 text-2xl text-win ring-1 ring-inset ring-win/30">
              ✓
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold">You&apos;re registered</h1>
            <p className="mt-2 text-muted">
              {firstName} {lastName} is entered in{' '}
              <span className="text-chalk">{division.name}</span> at {event.name}.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/account/registrations">View my registrations</ButtonLink>
              <ButtonLink href={`/events/${event.slug}`} variant="secondary">
                Back to event
              </ButtonLink>
            </div>
          </CardBody>
        </Card>
      </Container>
    );
  }

  const fee = division ? Math.round(division.priceCents * SERVICE_FEE_RATE) : 0;
  const total = division ? division.priceCents + fee : 0;

  async function confirm() {
    if (!division) return;
    setSubmitting(true);
    try {
      await api.createRegistration({
        eventId: event!.id,
        divisionId: division.id,
        firstName,
        lastName,
        beltRank: belt,
        academyName: academyName || null,
        weightClass: weightClass || null,
      });
      await queryClient.invalidateQueries({ queryKey: ['account'] });
      await queryClient.invalidateQueries({ queryKey: ['event', slug] });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container size="narrow" className="py-10">
      <Link href={`/events/${event.slug}`} className="text-sm text-muted hover:text-chalk">
        ← {event.name}
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold">Register</h1>

      <div className="mt-6">
        <Stepper step={step} />
      </div>

      <div className="mt-8">
        {step === 0 && (
          <div className="space-y-3">
            {event.divisions.map((d) => {
              const full = d.capacity != null && d.registeredCount >= d.capacity;
              const selected = d.id === divisionId;
              return (
                <button
                  key={d.id}
                  type="button"
                  disabled={full}
                  onClick={() => setDivisionId(d.id)}
                  className={cn(
                    'flex w-full items-center justify-between gap-4 rounded-lg border px-5 py-4 text-left transition-colors',
                    selected ? 'border-podium bg-podium/5' : 'border-line/10 bg-surface',
                    full ? 'cursor-not-allowed opacity-50' : 'hover:border-line/30',
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-chalk">{d.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {humanize(d.ruleset)} · {humanize(d.format)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm text-chalk">{formatPrice(d.priceCents)}</span>
                    {full && <Badge tone="muted">Full</Badge>}
                  </div>
                </button>
              );
            })}
            <div className="flex justify-end pt-2">
              <Button disabled={!division} onClick={() => setStep(1)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <Card>
            <CardBody className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-muted">First name</span>
                  <input
                    className={cn(inputClass, 'mt-1.5')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-muted">Last name</span>
                  <input
                    className={cn(inputClass, 'mt-1.5')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </label>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-muted">Belt rank</span>
                  <select
                    className={cn(inputClass, 'mt-1.5')}
                    value={belt}
                    onChange={(e) => setBelt(e.target.value as BeltRank)}
                  >
                    {BELT_RANKS.map((b) => (
                      <option key={b} value={b} className="bg-surface">
                        {humanize(b)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-muted">Weight class</span>
                  <input
                    className={cn(inputClass, 'mt-1.5')}
                    value={weightClass}
                    onChange={(e) => setWeightClass(e.target.value)}
                    placeholder="e.g. Featherweight (70kg)"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm text-muted">Academy</span>
                <input
                  className={cn(inputClass, 'mt-1.5')}
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  placeholder="Your team or gym"
                />
              </label>
              <div className="flex justify-between pt-1">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button disabled={!firstName || !lastName} onClick={() => setStep(2)}>
                  Continue
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {step === 2 && division && (
          <div className="space-y-4">
            <Card>
              <CardBody className="space-y-3">
                <h2 className="font-display text-lg font-bold">Review</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Competitor</span>
                    <span className="text-chalk">
                      {firstName} {lastName} · {humanize(belt)} belt
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Academy</span>
                    <span className="text-chalk">{academyName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Event</span>
                    <span className="text-chalk">{event.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Division</span>
                    <span className="text-right text-chalk">{division.name}</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Entry fee</span>
                  <span className="text-chalk">{formatPrice(division.priceCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Service fee</span>
                  <span className="text-chalk">{formatPrice(fee)}</span>
                </div>
                <div className="flex justify-between border-t border-line/10 pt-2 font-semibold">
                  <span>Total</span>
                  <span className="text-podium">{formatPrice(total)}</span>
                </div>
              </CardBody>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={confirm} disabled={submitting}>
                {submitting ? 'Processing…' : `Confirm · ${formatPrice(total)}`}
              </Button>
            </div>
            <p className="text-center text-xs text-muted">
              Demo checkout — no payment is taken. Confirming adds the registration to your account.
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-12">
          <div className="h-64 animate-pulse rounded-lg border border-line/10 bg-surface" />
        </Container>
      }
    >
      <RegisterFlow />
    </Suspense>
  );
}
