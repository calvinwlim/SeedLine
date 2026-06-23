'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Container } from '../../../components/ui/container';
import { Avatar } from '../../../components/ui/avatar';
import { Card, CardBody, EmptyState } from '../../../components/ui/card';
import { ButtonLink } from '../../../components/ui/button';
import { AthleteCard } from '../../../components/athlete-card';
import { MapView } from '../../../components/map/map-view';
import { StatTile } from '../../../components/stats/stat-tile';
import { MedalShelf } from '../../../components/stats/medal-shelf';
import { BeltBreakdown } from '../../../components/stats/belt-breakdown';
import { api } from '../../../lib/api';
import { countMedals, deriveTeamStats, beltBreakdown, recentMedals } from '../../../lib/gamify';
import { ordinalPlace } from '../../../lib/format';

export default function AcademyDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: academy, isLoading } = useQuery({
    queryKey: ['academy', slug],
    queryFn: () => api.getAcademy(slug),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="h-40 animate-pulse rounded-xl border border-line/10 bg-surface" />
      </Container>
    );
  }

  if (!academy) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Academy not found"
          action={<ButtonLink href="/academies">Back to academies</ButtonLink>}
        />
      </Container>
    );
  }

  const initials = academy.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase();
  const location = [academy.city, academy.country].filter(Boolean).join(', ');

  const stats = deriveTeamStats(academy.athletes, academy.achievements);
  const medals = countMedals(academy.achievements);
  const belts = beltBreakdown(academy.athletes);
  const recent = recentMedals(academy.achievements, 8);

  return (
    <main>
      <div className="border-b border-line/10 bg-surface">
        <Container className="py-10">
          <Link href="/academies" className="text-sm text-muted hover:text-chalk">
            ← All academies
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <Avatar initials={initials} size="lg" />
            <div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">{academy.name}</h1>
              <p className="mt-2 text-muted">{location || 'Location TBA'}</p>
              {academy.affiliation && (
                <p className="mt-0.5 text-sm text-muted">Affiliation: {academy.affiliation}</p>
              )}
              <p className="mt-3 text-sm text-muted">
                <span className="font-display text-base font-bold text-podium">{medals.gold}</span>{' '}
                gold · <span className="text-chalk">{stats.podiums}</span> podiums ·{' '}
                <span className="text-chalk">{stats.competitors}</span> competitors
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="grid gap-8 py-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10">
          <section>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Competitors" value={stats.competitors} />
              <StatTile label="Black belts" value={stats.blackBelts} accent="plain" />
              <StatTile label="Gold medals" value={medals.gold} accent="gold" />
              <StatTile label="Podiums" value={stats.podiums} accent="win" />
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold">Trophy shelf</h2>
            <MedalShelf medals={medals} />
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold">Belt breakdown</h2>
            <BeltBreakdown segments={belts} />
          </section>

          {academy.description && (
            <section>
              <h2 className="mb-3 font-display text-xl font-bold">About</h2>
              <p className="whitespace-pre-line text-muted">{academy.description}</p>
            </section>
          )}

          <section>
            <div className="flex items-end justify-between">
              <h2 className="font-display text-xl font-bold">Roster</h2>
              <span className="text-sm text-muted">{academy.athletes.length} competitors</span>
            </div>
            {academy.athletes.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {academy.athletes.map((athlete) => (
                  <AthleteCard key={athlete.id} athlete={athlete} />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">No competitors listed yet.</p>
            )}
          </section>

          {recent.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-xl font-bold">Recent results</h2>
              <Card className="divide-y divide-line/10">
                {recent.map((medal, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/events/${medal.eventSlug}`}
                        className="truncate text-sm font-medium text-chalk hover:text-podium"
                      >
                        {medal.eventName}
                      </Link>
                      <p className="truncate text-xs text-muted">{medal.divisionName}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-podium">
                      {ordinalPlace(medal.place)}
                    </span>
                  </div>
                ))}
              </Card>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-muted">Details</p>
              <div className="mt-2 space-y-2 text-sm">
                {academy.headCoach && (
                  <p>
                    <span className="text-muted">Head coach: </span>
                    <span className="text-chalk">{academy.headCoach}</span>
                  </p>
                )}
                {academy.foundedYear && (
                  <p>
                    <span className="text-muted">Founded: </span>
                    <span className="text-chalk">{academy.foundedYear}</span>
                  </p>
                )}
                <p>
                  <span className="text-muted">Members: </span>
                  <span className="text-chalk">{academy.memberCount}</span>
                </p>
                {academy.website && (
                  <p>
                    <a
                      href={academy.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-podium hover:underline"
                    >
                      Visit website →
                    </a>
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
          {academy.coordinates && (
            <MapView
              markers={[
                {
                  id: academy.id,
                  name: academy.name,
                  latitude: academy.coordinates.latitude,
                  longitude: academy.coordinates.longitude,
                  subtitle: location,
                },
              ]}
              height="h-56"
            />
          )}
        </aside>
      </Container>
    </main>
  );
}
