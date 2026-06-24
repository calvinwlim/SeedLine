'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BELT_RANKS,
  BRACKET_FORMATS,
  DISCIPLINES,
  EVENT_STATUSES,
  GENDERS,
  RULESETS,
  type BeltRank,
  type BracketFormat,
  type Discipline,
  type EventStatus,
  type Gender,
  type Ruleset,
} from '@openmat/types';
import { Container } from '../../../../components/ui/container';
import { Badge } from '../../../../components/ui/badge';
import { Button, ButtonLink } from '../../../../components/ui/button';
import { Card, CardBody, EmptyState } from '../../../../components/ui/card';
import { api } from '../../../../lib/api';
import { cn } from '../../../../lib/cn';
import {
  eventStatusLabel,
  eventStatusTone,
  formatPrice,
  humanize,
  registrationStatusLabel,
  registrationStatusTone,
} from '../../../../lib/format';

const fieldClass =
  'mt-1 w-full rounded-md border border-line/10 bg-bg px-3 py-2 text-sm text-chalk focus:border-accent/50 focus:outline-none';

function AddDivisionForm({ eventId, onAdded }: { eventId: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState<Discipline>('gi');
  const [gender, setGender] = useState<Gender>('male');
  const [belt, setBelt] = useState<BeltRank | ''>('blue');
  const [ruleset, setRuleset] = useState<Ruleset>('ibjjf');
  const [format, setFormat] = useState<BracketFormat>('single_elimination');
  const [price, setPrice] = useState('95');
  const [capacity, setCapacity] = useState('32');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await api.addDivision(eventId, {
        name: name.trim(),
        discipline,
        gender,
        beltRank: belt || null,
        ageCategory: 'Adult',
        weightClass: null,
        ruleset,
        format,
        priceCents: Math.round((Number(price) || 0) * 100),
        capacity: capacity ? Number(capacity) : null,
      });
      setName('');
      onAdded();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        + Add division
      </Button>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <label className="block">
          <span className="text-sm text-muted">Division name</span>
          <input
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adult / Gi / Male / Blue / Light"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm text-muted">Discipline</span>
            <select
              className={fieldClass}
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value as Discipline)}
            >
              {DISCIPLINES.map((d) => (
                <option key={d} value={d} className="bg-surface">
                  {humanize(d)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-muted">Gender</span>
            <select
              className={fieldClass}
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g} className="bg-surface">
                  {humanize(g)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-muted">Belt</span>
            <select
              className={fieldClass}
              value={belt}
              onChange={(e) => setBelt(e.target.value as BeltRank | '')}
            >
              <option value="" className="bg-surface">
                Any
              </option>
              {BELT_RANKS.map((b) => (
                <option key={b} value={b} className="bg-surface">
                  {humanize(b)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="block">
            <span className="text-sm text-muted">Ruleset</span>
            <select
              className={fieldClass}
              value={ruleset}
              onChange={(e) => setRuleset(e.target.value as Ruleset)}
            >
              {RULESETS.map((r) => (
                <option key={r} value={r} className="bg-surface">
                  {humanize(r)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-muted">Format</span>
            <select
              className={fieldClass}
              value={format}
              onChange={(e) => setFormat(e.target.value as BracketFormat)}
            >
              {BRACKET_FORMATS.map((f) => (
                <option key={f} value={f} className="bg-surface">
                  {humanize(f)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-muted">Price ($)</span>
            <input
              className={fieldClass}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="numeric"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Capacity</span>
            <input
              className={fieldClass}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              inputMode="numeric"
            />
          </label>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={!name.trim() || submitting}>
            {submitting ? 'Adding…' : 'Add division'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export default function ManageEventPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const queryClient = useQueryClient();
  const [savingStatus, setSavingStatus] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => api.getEvent(slug),
    enabled: Boolean(slug),
  });

  const { data: registrations } = useQuery({
    queryKey: ['event-registrations', event?.id],
    queryFn: () => api.listEventRegistrations(event!.id),
    enabled: Boolean(event?.id),
  });

  async function changeStatus(status: EventStatus) {
    if (!event) return;
    setSavingStatus(true);
    try {
      await api.updateEventStatus(event.id, status);
      await queryClient.invalidateQueries({ queryKey: ['event', slug] });
      await queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
    } finally {
      setSavingStatus(false);
    }
  }

  function refetchEvent() {
    queryClient.invalidateQueries({ queryKey: ['event', slug] });
    queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
  }

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
          action={<ButtonLink href="/organizer">Back to dashboard</ButtonLink>}
        />
      </Container>
    );
  }

  return (
    <main>
      <div className="border-b border-line/10 bg-surface">
        <Container className="py-10">
          <Link href="/organizer" className="text-sm text-muted hover:text-chalk">
            ← Organizer
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone={eventStatusTone(event.status)}>{eventStatusLabel(event.status)}</Badge>
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold">{event.name}</h1>
            </div>
            <div className="flex shrink-0 gap-2">
              <ButtonLink href={`/events/${event.slug}`} variant="secondary">
                View public page
              </ButtonLink>
              <ButtonLink href={`/events/${event.slug}/schedule`} variant="secondary">
                Schedule
              </ButtonLink>
            </div>
          </div>
        </Container>
      </div>

      <Container className="space-y-10 py-10">
        <section>
          <h2 className="font-display text-xl font-bold">Status</h2>
          <p className="mt-1 text-sm text-muted">Move the event through its lifecycle.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {EVENT_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                disabled={savingStatus || status === event.status}
                onClick={() => changeStatus(status)}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed',
                  status === event.status
                    ? 'border-accent bg-accent/10 text-chalk'
                    : 'border-line/10 text-muted hover:border-line/30 hover:text-chalk',
                )}
              >
                {eventStatusLabel(status)}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Divisions</h2>
            <AddDivisionForm eventId={event.id} onAdded={refetchEvent} />
          </div>
          <div className="mt-4">
            {event.divisions.length === 0 ? (
              <EmptyState
                title="No divisions yet"
                description="Add at least one division so athletes can register."
              />
            ) : (
              <Card className="divide-y divide-line/10">
                {event.divisions.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-chalk">{d.name}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {humanize(d.ruleset)} · {humanize(d.format)} · {d.registeredCount}
                        {d.capacity != null ? ` / ${d.capacity}` : ''} registered
                      </p>
                    </div>
                    <span className="shrink-0 text-sm text-chalk">{formatPrice(d.priceCents)}</span>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Registrations</h2>
            <span className="text-sm text-muted">{registrations?.length ?? 0} total</span>
          </div>
          <div className="mt-4">
            {registrations && registrations.length > 0 ? (
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-line/[0.02] text-left text-xs uppercase tracking-wide text-muted">
                      <th className="px-5 py-2.5 font-medium">Competitor</th>
                      <th className="px-5 py-2.5 font-medium">Academy</th>
                      <th className="px-5 py-2.5 font-medium">Division</th>
                      <th className="px-5 py-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/5">
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td className="px-5 py-3 text-chalk">
                          {reg.athleteSlug ? (
                            <Link
                              href={`/athletes/${reg.athleteSlug}`}
                              className="hover:text-accent"
                            >
                              {reg.athleteName}
                            </Link>
                          ) : (
                            reg.athleteName
                          )}
                        </td>
                        <td className="px-5 py-3 text-muted">{reg.academyName ?? '—'}</td>
                        <td className="px-5 py-3 text-muted">{reg.divisionName}</td>
                        <td className="px-5 py-3">
                          <Badge tone={registrationStatusTone(reg.status)}>
                            {registrationStatusLabel(reg.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ) : (
              <EmptyState
                title="No registrations yet"
                description="Registrations appear here as athletes sign up."
              />
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}
