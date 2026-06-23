'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Container } from '../../../../../components/ui/container';
import { Badge } from '../../../../../components/ui/badge';
import { ButtonLink } from '../../../../../components/ui/button';
import { Card, CardBody, EmptyState } from '../../../../../components/ui/card';
import { BracketView } from '../../../../../components/bracket/bracket-view';
import { api } from '../../../../../lib/api';
import { autoCompleteBracket, buildBracket, derivePodium } from '../../../../../lib/bracket';
import { formatPrice, humanize, ordinalPlace } from '../../../../../lib/format';

export default function DivisionBracketPage() {
  const params = useParams<{ slug: string; divisionId: string }>();
  const { slug, divisionId } = params;

  const { data: division, isLoading } = useQuery({
    queryKey: ['division', slug, divisionId],
    queryFn: () => api.getDivision(slug, divisionId),
    enabled: Boolean(slug && divisionId),
  });

  const bracket = useMemo(() => {
    if (!division) return null;
    try {
      const generated = buildBracket(division.format, division.entrants);
      return division.resultsFinal ? autoCompleteBracket(generated) : generated;
    } catch {
      return null;
    }
  }, [division]);

  const podium = useMemo(() => {
    if (!bracket || !division?.resultsFinal) return [];
    const names = new Map(bracket.entrants.map((e) => [e.id, e.name ?? e.id]));
    return derivePodium(bracket).map((p) => ({
      place: p.place,
      name: names.get(p.entrantId) ?? p.entrantId,
    }));
  }, [bracket, division]);

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="h-64 animate-pulse rounded-lg border border-white/10 bg-surface" />
      </Container>
    );
  }

  if (!division) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Division not found"
          action={<ButtonLink href="/events">Back to events</ButtonLink>}
        />
      </Container>
    );
  }

  return (
    <main>
      <div className="border-b border-white/10 bg-surface/40">
        <Container className="py-10">
          <Link
            href={`/events/${division.eventSlug}`}
            className="text-sm text-muted hover:text-chalk"
          >
            ← {division.eventName}
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">{division.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone="outline">{humanize(division.discipline)}</Badge>
                <Badge tone="muted">{humanize(division.ruleset)}</Badge>
                <Badge tone="muted">{humanize(division.format)}</Badge>
                {division.resultsFinal ? (
                  <Badge tone="muted">Final results</Badge>
                ) : (
                  <Badge tone="green">{division.entrants.length} entrants</Badge>
                )}
              </div>
            </div>
            <ButtonLink href={`/events/${division.eventSlug}/register?division=${division.id}`}>
              Register · {formatPrice(division.priceCents)}
            </ButtonLink>
          </div>
        </Container>
      </div>

      <Container className="space-y-8 py-10">
        {podium.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-bold">Podium</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {podium.map((p) => (
                <Card key={p.place}>
                  <CardBody className="flex items-center gap-3">
                    <span className="font-display text-2xl font-bold text-podium">
                      {ordinalPlace(p.place)}
                    </span>
                    <span className="font-medium text-chalk">{p.name}</span>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-xl font-bold">Bracket</h2>
            <span className="text-sm text-muted">{division.entrants.length} competitors</span>
          </div>
          <div className="mt-4">
            {bracket ? (
              <BracketView bracket={bracket} />
            ) : (
              <p className="text-sm text-muted">
                This bracket format is not supported in the viewer yet.
              </p>
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}
