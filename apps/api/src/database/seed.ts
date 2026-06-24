/**
 * Seed a representative dataset so the web app renders real data in `live`
 * mode. Run with: `npm run db:seed --workspace @openmat/api` (after db:push).
 *
 * Idempotent: clears the seeded tables first, then re-inserts. Slugs mirror the
 * web app's mock fixtures so live mode feels continuous with mock mode.
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import {
  academies,
  athletes,
  divisions,
  events,
  medals,
  organizers,
  registrations,
  users,
} from './schema';

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgres://openmat:openmat@localhost:5432/openmat';

const DAY = 86_400_000;
const now = Date.now();
const daysFromNow = (n: number): Date => new Date(now + n * DAY);

const academySeed = [
  {
    name: 'Atos HQ',
    slug: 'atos-hq-san-diego',
    city: 'San Diego',
    country: 'United States',
    headCoach: 'André Galvão',
    foundedYear: 2012,
    affiliation: 'Atos Jiu-Jitsu',
    website: 'https://example.com/atos',
    latitude: 32.8211,
    longitude: -117.1392,
    description:
      'Atos Jiu-Jitsu headquarters in San Diego, built on a pressure-passing, position-before-submission style.',
  },
  {
    name: 'Alliance São Paulo',
    slug: 'alliance-sao-paulo',
    city: 'São Paulo',
    country: 'Brazil',
    headCoach: 'Fabio Gurgel',
    foundedYear: 1993,
    affiliation: 'Alliance',
    website: 'https://example.com/alliance',
    latitude: -23.5982,
    longitude: -46.6708,
    description: 'One of the most decorated teams in the sport, based in São Paulo.',
  },
  {
    name: 'Art of Jiu Jitsu',
    slug: 'art-of-jiu-jitsu',
    city: 'Costa Mesa',
    country: 'United States',
    headCoach: 'Ramon Lemos',
    foundedYear: 2013,
    affiliation: 'AOJ',
    website: 'https://example.com/aoj',
    latitude: 33.6695,
    longitude: -117.9132,
    description: 'Home of a modern, guard-driven competition methodology in Costa Mesa.',
  },
];

interface AthleteSeed {
  academySlug: string;
  slug: string;
  firstName: string;
  lastName: string;
  beltRank: (typeof schema.beltRankEnum.enumValues)[number];
  discipline: (typeof schema.disciplineEnum.enumValues)[number];
  weightClass: string;
  ageCategory: string;
  country: string;
  bio: string;
  record: { matches: number; wins: number; losses: number; submissions: number; gold: number };
}

const athleteSeed: AthleteSeed[] = [
  {
    academySlug: 'atos-hq-san-diego',
    slug: 'mateus-costa',
    firstName: 'Mateus',
    lastName: 'Costa',
    beltRank: 'black',
    discipline: 'gi',
    weightClass: 'Featherweight (70kg)',
    ageCategory: 'Adult',
    country: 'Brazil',
    bio: 'Featherweight black belt with a relentless guard-passing game and a habit of finishing early.',
    record: { matches: 142, wins: 118, losses: 24, submissions: 71, gold: 14 },
  },
  {
    academySlug: 'alliance-sao-paulo',
    slug: 'beatriz-silva',
    firstName: 'Beatriz',
    lastName: 'Silva',
    beltRank: 'black',
    discipline: 'gi',
    weightClass: 'Lightweight (64kg)',
    ageCategory: 'Adult',
    country: 'Brazil',
    bio: 'Two-time world medalist known for a suffocating top game and an unbreakable closed guard.',
    record: { matches: 121, wins: 99, losses: 22, submissions: 54, gold: 11 },
  },
  {
    academySlug: 'art-of-jiu-jitsu',
    slug: 'jisoo-park',
    firstName: 'Jisoo',
    lastName: 'Park',
    beltRank: 'purple',
    discipline: 'gi',
    weightClass: 'Rooster (57kg)',
    ageCategory: 'Adult',
    country: 'South Korea',
    bio: 'Rising purple belt with a modern guard built on the AOJ methodology.',
    record: { matches: 38, wins: 29, losses: 9, submissions: 17, gold: 4 },
  },
  {
    academySlug: 'atos-hq-san-diego',
    slug: 'an-nguyen',
    firstName: 'An',
    lastName: 'Nguyen',
    beltRank: 'brown',
    discipline: 'nogi',
    weightClass: 'Lightweight (77kg)',
    ageCategory: 'Adult',
    country: 'United States',
    bio: 'No-gi leg-lock specialist. Submission-only is home turf.',
    record: { matches: 64, wins: 49, losses: 15, submissions: 38, gold: 6 },
  },
  {
    academySlug: 'atos-hq-san-diego',
    slug: 'yara-haddad',
    firstName: 'Yara',
    lastName: 'Haddad',
    beltRank: 'blue',
    discipline: 'nogi',
    weightClass: 'Featherweight (58kg)',
    ageCategory: 'Adult',
    country: 'United States',
    bio: 'Blue belt competitor balancing gi and no-gi, with a fast-developing back-attack system.',
    record: { matches: 26, wins: 18, losses: 8, submissions: 9, gold: 2 },
  },
];

const eventSeed = [
  {
    slug: 'openmat-summer-open-2026',
    name: 'OpenMat Summer Open 2026',
    venueName: 'San Diego Convention Center',
    address: '111 W Harbor Dr',
    city: 'San Diego',
    country: 'United States',
    latitude: 32.7065,
    longitude: -117.1614,
    description:
      'A two-day gi and no-gi tournament for all belt levels, run on six mats with live brackets and matside scoring.',
    scheduleNote: 'Day 1: gi (white–purple). Day 2: gi (brown/black) + all no-gi.',
    startOffset: 18,
    divisions: [
      {
        name: 'Adult / Gi / Male / White / Feather',
        discipline: 'gi' as const,
        gender: 'male' as const,
        beltRank: 'white' as const,
        ruleset: 'ibjjf' as const,
        format: 'single_elimination' as const,
        priceCents: 8500,
        capacity: 32,
      },
      {
        name: 'Adult / Gi / Female / Black / Light',
        discipline: 'gi' as const,
        gender: 'female' as const,
        beltRank: 'black' as const,
        ruleset: 'ibjjf' as const,
        format: 'single_elimination' as const,
        priceCents: 9500,
        capacity: 16,
      },
    ],
  },
  {
    slug: 'west-coast-nogi-championship-2026',
    name: 'West Coast No-Gi Championship',
    venueName: 'Anaheim Convention Center',
    address: '800 W Katella Ave',
    city: 'Anaheim',
    country: 'United States',
    latitude: 33.8003,
    longitude: -117.9189,
    description:
      'A no-gi only championship under ADCC and submission-only rulesets, with a black-belt absolute superfight.',
    scheduleNote: 'Absolute and superfight brackets seeded from division results.',
    startOffset: 40,
    divisions: [
      {
        name: 'Adult / No-Gi / Male / Advanced / Light',
        discipline: 'nogi' as const,
        gender: 'male' as const,
        beltRank: null,
        ruleset: 'adcc' as const,
        format: 'double_elimination' as const,
        priceCents: 9500,
        capacity: 32,
      },
      {
        name: 'Adult / No-Gi / Female / Advanced / Feather',
        discipline: 'nogi' as const,
        gender: 'female' as const,
        beltRank: null,
        ruleset: 'adcc' as const,
        format: 'single_elimination' as const,
        priceCents: 9500,
        capacity: 16,
      },
    ],
  },
];

async function main(): Promise<void> {
  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client, { schema });

  // Clear seeded tables in FK-safe order.
  await db.delete(medals);
  await db.delete(registrations);
  await db.delete(divisions);
  await db.delete(events);
  await db.delete(athletes);
  await db.delete(academies);
  await db.delete(organizers);
  await db.delete(users);

  const [orgUser] = await db
    .insert(users)
    .values({ email: 'organizer@openmat.dev', name: 'OpenMat Events', role: 'organizer' })
    .returning();
  const [organizer] = await db
    .insert(organizers)
    .values({ userId: orgUser!.id, name: 'OpenMat Events', slug: 'openmat-events' })
    .returning();

  const academyRows = await db.insert(academies).values(academySeed).returning();
  const academyBySlug = new Map(academyRows.map((a) => [a.slug, a]));

  const athleteRows = await db
    .insert(athletes)
    .values(
      athleteSeed.map((a) => ({
        academyId: academyBySlug.get(a.academySlug)!.id,
        slug: a.slug,
        firstName: a.firstName,
        lastName: a.lastName,
        beltRank: a.beltRank,
        discipline: a.discipline,
        weightClass: a.weightClass,
        ageCategory: a.ageCategory,
        country: a.country,
        bio: a.bio,
        matchesCount: a.record.matches,
        wins: a.record.wins,
        losses: a.record.losses,
        submissions: a.record.submissions,
        goldMedals: a.record.gold,
      })),
    )
    .returning();
  const athleteBySlug = new Map(athleteRows.map((a) => [a.slug, a]));

  const medalValues: (typeof medals.$inferInsert)[] = [];

  for (const e of eventSeed) {
    const [event] = await db
      .insert(events)
      .values({
        organizerId: organizer!.id,
        name: e.name,
        slug: e.slug,
        description: e.description,
        scheduleNote: e.scheduleNote,
        venueName: e.venueName,
        address: e.address,
        city: e.city,
        country: e.country,
        latitude: e.latitude,
        longitude: e.longitude,
        startDate: daysFromNow(e.startOffset),
        endDate: daysFromNow(e.startOffset + 1),
        registrationOpensAt: daysFromNow(-30),
        registrationClosesAt: daysFromNow(e.startOffset - 7),
        status: 'registration_open',
      })
      .returning();

    const divisionRows = await db
      .insert(divisions)
      .values(e.divisions.map((d) => ({ eventId: event!.id, ...d })))
      .returning();

    // Register every athlete whose discipline matches the first division.
    const firstDivision = divisionRows[0]!;
    let seed = 1;
    for (const athlete of athleteRows) {
      if (athlete.discipline !== firstDivision.discipline) continue;
      await db.insert(registrations).values({
        eventId: event!.id,
        divisionId: firstDivision.id,
        athleteId: athlete.id,
        status: 'confirmed',
        seed: seed++,
      });
    }

    // Award podiums on past-dated copies of these events.
    for (const a of athleteSeed) {
      const athlete = athleteBySlug.get(a.slug)!;
      const golds = Math.min(a.record.gold, 4);
      const places = [...Array<number>(golds).fill(1), 2, 3];
      places.forEach((place, i) => {
        medalValues.push({
          athleteId: athlete.id,
          eventId: event!.id,
          divisionName: e.divisions[i % e.divisions.length]!.name,
          place,
          awardedAt: daysFromNow(-(30 * (i + 1) + e.startOffset)),
        });
      });
    }
  }

  if (medalValues.length > 0) await db.insert(medals).values(medalValues);

  const counts = {
    academies: academyRows.length,
    athletes: athleteRows.length,
    events: eventSeed.length,
    medals: medalValues.length,
  };
  console.log('Seed complete:', counts);

  await client.end();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
