'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { DISCIPLINES, type Discipline } from '@openmat/types';
import { Container } from '../../../../components/ui/container';
import { Card, CardBody } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { api } from '../../../../lib/api';
import { cn } from '../../../../lib/cn';
import { humanize } from '../../../../lib/format';

const inputClass =
  'mt-1.5 w-full rounded-md border border-white/10 bg-ink px-3 py-2.5 text-sm text-chalk placeholder:text-muted focus:border-podium/50 focus:outline-none';

function toIso(date: string): string {
  // A bare yyyy-mm-dd from <input type="date">; anchor to midday UTC.
  return date ? new Date(`${date}T12:00:00.000Z`).toISOString() : '';
}

export default function NewEventPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [regCloses, setRegCloses] = useState('');
  const [description, setDescription] = useState('');
  const [disciplines, setDisciplines] = useState<Discipline[]>(['gi']);
  const [submitting, setSubmitting] = useState(false);

  function toggleDiscipline(d: Discipline) {
    setDisciplines((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  const valid = name.trim() && startDate && endDate && disciplines.length > 0;

  async function submit() {
    if (!valid) return;
    setSubmitting(true);
    try {
      const event = await api.createEvent({
        name: name.trim(),
        venueName: venueName || null,
        address: address || null,
        city: city || null,
        country: country || null,
        startDate: toIso(startDate),
        endDate: toIso(endDate || startDate),
        registrationOpensAt: new Date().toISOString(),
        registrationClosesAt: regCloses ? toIso(regCloses) : null,
        description: description || 'No description yet.',
        disciplines,
      });
      await queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      await queryClient.invalidateQueries({ queryKey: ['organizer'] });
      router.push(`/organizer/events/${event.slug}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container size="narrow" className="py-10">
      <Link href="/organizer" className="text-sm text-muted hover:text-chalk">
        ← Organizer
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold">New event</h1>
      <p className="mt-2 text-muted">
        Create a draft event. You can add divisions and publish it once it&apos;s ready.
      </p>

      <Card className="mt-8">
        <CardBody className="space-y-5">
          <label className="block">
            <span className="text-sm text-muted">Event name</span>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Open 2026"
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted">Venue</span>
            <input
              className={inputClass}
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Convention center, gym, …"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-muted">City</span>
              <input
                className={inputClass}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">Country</span>
              <input
                className={inputClass}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-muted">Address</span>
            <input
              className={inputClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm text-muted">Start date</span>
              <input
                type="date"
                className={inputClass}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">End date</span>
              <input
                type="date"
                className={inputClass}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">Registration closes</span>
              <input
                type="date"
                className={inputClass}
                value={regCloses}
                onChange={(e) => setRegCloses(e.target.value)}
              />
            </label>
          </div>

          <div>
            <span className="text-sm text-muted">Disciplines</span>
            <div className="mt-2 flex gap-2">
              {DISCIPLINES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDiscipline(d)}
                  className={cn(
                    'rounded-md border px-4 py-2 text-sm transition-colors',
                    disciplines.includes(d)
                      ? 'border-podium bg-podium/10 text-chalk'
                      : 'border-white/10 text-muted hover:border-white/30',
                  )}
                >
                  {humanize(d)}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm text-muted">Description</span>
            <textarea
              className={inputClass}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What competitors should know about this event."
            />
          </label>
        </CardBody>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push('/organizer')}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!valid || submitting}>
          {submitting ? 'Creating…' : 'Create draft event'}
        </Button>
      </div>
    </Container>
  );
}
