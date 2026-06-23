import type {
  AcademyDetail,
  AthleteProfile,
  DivisionSummary,
  EventDetail,
  RegistrationSummary,
} from '@openmat/types';

/**
 * In-memory fixtures that let the web app run, and be developed against, with
 * no API and no database. They mirror the shape of the real DTOs in
 * `@openmat/types`, so swapping `NEXT_PUBLIC_DATA_SOURCE=live` later is a
 * drop-in change rather than a rewrite.
 *
 * The data is intentionally cross-linked (athletes belong to academies, register
 * for events, and earn medals) so every page renders something believable.
 */

// Anchor relative dates to a fixed "today" so the seed stays stable in demos.
const TODAY = new Date('2026-06-22T00:00:00Z');

function daysFromToday(days: number, hour = 9): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

function usd(dollars: number): number {
  return Math.round(dollars * 100);
}

// --- Academies -------------------------------------------------------------

interface MockAcademy extends AcademyDetail {}

export const academies: MockAcademy[] = [
  {
    id: 'aca_atos',
    slug: 'atos-hq-san-diego',
    name: 'Atos HQ',
    city: 'San Diego',
    country: 'United States',
    logoUrl: null,
    memberCount: 184,
    description:
      'Atos Jiu-Jitsu headquarters in San Diego, founded on a pressure-passing, position-before-submission style that has produced a generation of world champions.',
    headCoach: 'André Galvão',
    foundedYear: 2008,
    affiliation: 'Atos Jiu-Jitsu',
    website: 'https://example.com/atos',
    coordinates: { latitude: 32.8211, longitude: -117.1392 },
    athletes: [],
    achievements: [],
  },
  {
    id: 'aca_aoj',
    slug: 'art-of-jiu-jitsu',
    name: 'Art of Jiu Jitsu',
    city: 'Costa Mesa',
    country: 'United States',
    logoUrl: null,
    memberCount: 142,
    description:
      'Known as "the blue basement," AOJ is built around a precise, modern guard game and the Mendes brothers’ competition methodology.',
    headCoach: 'Rafael & Guilherme Mendes',
    foundedYear: 2012,
    affiliation: 'Art of Jiu Jitsu',
    website: 'https://example.com/aoj',
    coordinates: { latitude: 33.6695, longitude: -117.9132 },
    athletes: [],
    achievements: [],
  },
  {
    id: 'aca_gracie_barra',
    slug: 'gracie-barra-london',
    name: 'Gracie Barra London',
    city: 'London',
    country: 'United Kingdom',
    logoUrl: null,
    memberCount: 96,
    description:
      'A flagship Gracie Barra school bringing the "organized jiu-jitsu" curriculum to central London for hobbyists and competitors alike.',
    headCoach: 'Dickson Pinto',
    foundedYear: 2010,
    affiliation: 'Gracie Barra',
    website: 'https://example.com/gb-london',
    coordinates: { latitude: 51.5154, longitude: -0.1419 },
    athletes: [],
    achievements: [],
  },
  {
    id: 'aca_alliance',
    slug: 'alliance-sao-paulo',
    name: 'Alliance São Paulo',
    city: 'São Paulo',
    country: 'Brazil',
    logoUrl: null,
    memberCount: 210,
    description:
      'The winningest team in IBJJF history, Alliance’s São Paulo headquarters is a relentless competition factory.',
    headCoach: 'Fabio Gurgel',
    foundedYear: 1993,
    affiliation: 'Alliance',
    website: 'https://example.com/alliance',
    coordinates: { latitude: -23.5982, longitude: -46.6708 },
    athletes: [],
    achievements: [],
  },
  {
    id: 'aca_10p',
    slug: '10th-planet-austin',
    name: '10th Planet Austin',
    city: 'Austin',
    country: 'United States',
    logoUrl: null,
    memberCount: 88,
    description:
      'A no-gi specialist school built on the 10th Planet system — rubber guard, the truck, and a leg-lock-heavy approach to submission-only competition.',
    headCoach: 'Daniel Strauss',
    foundedYear: 2016,
    affiliation: '10th Planet',
    website: 'https://example.com/10p-austin',
    coordinates: { latitude: 30.2672, longitude: -97.7431 },
    athletes: [],
    achievements: [],
  },
];

// --- Athletes --------------------------------------------------------------

interface MockAthlete extends AthleteProfile {}

function buildAthletes(): MockAthlete[] {
  const base: Array<
    Omit<AthleteProfile, 'academyName' | 'academySlug' | 'registrations' | 'achievements'> & {
      academyId: string;
    }
  > = [
    {
      id: 'ath_costa',
      slug: 'mateus-costa',
      firstName: 'Mateus',
      lastName: 'Costa',
      beltRank: 'black',
      discipline: 'gi',
      academyId: 'aca_atos',
      country: 'Brazil',
      avatarUrl: null,
      bio: 'Featherweight black belt with a relentless guard-passing game and a habit of finishing matches early.',
      weightClass: 'Featherweight (70kg)',
      ageCategory: 'Adult',
      record: { matches: 142, wins: 118, losses: 24, draws: 0, submissions: 71, goldMedals: 14 },
    },
    {
      id: 'ath_nguyen',
      slug: 'an-nguyen',
      firstName: 'An',
      lastName: 'Nguyen',
      beltRank: 'brown',
      discipline: 'nogi',
      academyId: 'aca_10p',
      country: 'United States',
      avatarUrl: null,
      bio: 'No-gi leg-lock specialist competing out of Austin. Submission-only is home turf.',
      weightClass: 'Lightweight (77kg)',
      ageCategory: 'Adult',
      record: { matches: 64, wins: 49, losses: 15, draws: 0, submissions: 38, goldMedals: 6 },
    },
    {
      id: 'ath_silva',
      slug: 'beatriz-silva',
      firstName: 'Beatriz',
      lastName: 'Silva',
      beltRank: 'black',
      discipline: 'gi',
      academyId: 'aca_alliance',
      country: 'Brazil',
      avatarUrl: null,
      bio: 'Two-time world medalist known for a suffocating top game and an unbreakable closed guard.',
      weightClass: 'Lightweight (64kg)',
      ageCategory: 'Adult',
      record: { matches: 121, wins: 99, losses: 22, draws: 0, submissions: 54, goldMedals: 11 },
    },
    {
      id: 'ath_park',
      slug: 'jisoo-park',
      firstName: 'Jisoo',
      lastName: 'Park',
      beltRank: 'purple',
      discipline: 'gi',
      academyId: 'aca_aoj',
      country: 'South Korea',
      avatarUrl: null,
      bio: 'Rising purple belt with a modern guard built on the AOJ methodology.',
      weightClass: 'Rooster (57kg)',
      ageCategory: 'Adult',
      record: { matches: 38, wins: 29, losses: 9, draws: 0, submissions: 17, goldMedals: 4 },
    },
    {
      id: 'ath_okafor',
      slug: 'chidi-okafor',
      firstName: 'Chidi',
      lastName: 'Okafor',
      beltRank: 'brown',
      discipline: 'gi',
      academyId: 'aca_gracie_barra',
      country: 'United Kingdom',
      avatarUrl: null,
      bio: 'Heavyweight brown belt with a pressure-passing style honed in central London.',
      weightClass: 'Heavyweight (100kg)',
      ageCategory: 'Adult',
      record: { matches: 52, wins: 40, losses: 12, draws: 0, submissions: 22, goldMedals: 5 },
    },
    {
      id: 'ath_haddad',
      slug: 'yara-haddad',
      firstName: 'Yara',
      lastName: 'Haddad',
      beltRank: 'blue',
      discipline: 'nogi',
      academyId: 'aca_atos',
      country: 'United States',
      avatarUrl: null,
      bio: 'Blue belt competitor balancing gi and no-gi, with a fast-developing back-attack system.',
      weightClass: 'Featherweight (58kg)',
      ageCategory: 'Adult',
      record: { matches: 26, wins: 18, losses: 8, draws: 0, submissions: 9, goldMedals: 2 },
    },
    {
      id: 'ath_mendoza',
      slug: 'diego-mendoza',
      firstName: 'Diego',
      lastName: 'Mendoza',
      beltRank: 'black',
      discipline: 'nogi',
      academyId: 'aca_10p',
      country: 'United States',
      avatarUrl: null,
      bio: 'No-gi black belt and ADCC trials veteran. Wrestling-heavy, submission-hunting.',
      weightClass: 'Middleweight (88kg)',
      ageCategory: 'Adult',
      record: { matches: 97, wins: 74, losses: 23, draws: 0, submissions: 41, goldMedals: 8 },
    },
    {
      id: 'ath_tanaka',
      slug: 'rina-tanaka',
      firstName: 'Rina',
      lastName: 'Tanaka',
      beltRank: 'purple',
      discipline: 'gi',
      academyId: 'aca_aoj',
      country: 'Japan',
      avatarUrl: null,
      bio: 'Technical purple belt with a berimbolo-driven guard and sharp competition instincts.',
      weightClass: 'Light-feather (53kg)',
      ageCategory: 'Adult',
      record: { matches: 44, wins: 33, losses: 11, draws: 0, submissions: 19, goldMedals: 4 },
    },
  ];

  return base.map((a) => {
    const academy = academies.find((x) => x.id === a.academyId) ?? null;
    return {
      ...a,
      academyName: academy?.name ?? null,
      academySlug: academy?.slug ?? null,
      registrations: [],
      achievements: [],
    };
  });
}

export const athletes: MockAthlete[] = buildAthletes();

// --- Events & divisions ----------------------------------------------------

function divisions(
  eventId: string,
  specs: Array<Partial<DivisionSummary> & { name: string }>,
): DivisionSummary[] {
  return specs.map((s, i) => ({
    id: `${eventId}_div_${i + 1}`,
    discipline: 'gi',
    gender: 'male',
    beltRank: 'blue',
    ageCategory: 'Adult',
    weightClass: null,
    ruleset: 'ibjjf',
    format: 'single_elimination',
    priceCents: usd(95),
    capacity: 32,
    registeredCount: 12,
    ...s,
  }));
}

interface MockEvent extends EventDetail {}

export const events: MockEvent[] = [
  {
    id: 'evt_summer_open',
    slug: 'openmat-summer-open-2026',
    name: 'OpenMat Summer Open 2026',
    venueName: 'San Diego Convention Center',
    address: '111 W Harbor Dr',
    city: 'San Diego',
    country: 'United States',
    coordinates: { latitude: 32.7065, longitude: -117.1614 },
    startDate: daysFromToday(18),
    endDate: daysFromToday(19),
    registrationOpensAt: daysFromToday(-30),
    registrationClosesAt: daysFromToday(11),
    status: 'registration_open',
    coverImageUrl: null,
    disciplines: ['gi', 'nogi'],
    rulesets: ['ibjjf'],
    divisionCount: 5,
    registeredCount: 248,
    startingPriceCents: usd(85),
    description:
      'A two-day gi and no-gi tournament for all belt levels, run on six mats with live brackets and matside scoring. The flagship OpenMat event of the summer.',
    scheduleNote: 'Day 1: gi (white–purple). Day 2: gi (brown/black) + all no-gi.',
    organizer: { id: 'org_openmat', slug: 'openmat-events', name: 'OpenMat Events', logoUrl: null },
    divisions: divisions('evt_summer_open', [
      {
        name: 'Adult / Gi / Male / White / Feather',
        beltRank: 'white',
        registeredCount: 24,
        capacity: 32,
      },
      {
        name: 'Adult / Gi / Male / Blue / Light',
        beltRank: 'blue',
        registeredCount: 30,
        capacity: 32,
      },
      {
        name: 'Adult / Gi / Female / Purple / Feather',
        gender: 'female',
        beltRank: 'purple',
        registeredCount: 11,
        capacity: 16,
      },
      {
        name: 'Adult / No-Gi / Male / Brown-Black / Middle',
        discipline: 'nogi',
        beltRank: 'black',
        ruleset: 'adcc',
        registeredCount: 14,
        capacity: 16,
      },
      {
        name: 'Masters 1 / Gi / Male / Blue / Medium-Heavy',
        ageCategory: 'Masters 1',
        beltRank: 'blue',
        registeredCount: 9,
        capacity: 16,
      },
    ]),
  },
  {
    id: 'evt_no_gi_worlds',
    slug: 'west-coast-nogi-championship-2026',
    name: 'West Coast No-Gi Championship',
    venueName: 'Anaheim Convention Center',
    address: '800 W Katella Ave',
    city: 'Anaheim',
    country: 'United States',
    coordinates: { latitude: 33.8003, longitude: -117.9189 },
    startDate: daysFromToday(40),
    endDate: daysFromToday(41),
    registrationOpensAt: daysFromToday(-10),
    registrationClosesAt: daysFromToday(33),
    status: 'registration_open',
    coverImageUrl: null,
    disciplines: ['nogi'],
    rulesets: ['adcc', 'submission_only'],
    divisionCount: 4,
    registeredCount: 132,
    startingPriceCents: usd(90),
    description:
      'A no-gi only championship under ADCC and submission-only rulesets, with a black-belt absolute superfight to close the night.',
    scheduleNote: 'Absolute and superfight brackets seeded from division results.',
    organizer: { id: 'org_openmat', slug: 'openmat-events', name: 'OpenMat Events', logoUrl: null },
    divisions: divisions('evt_no_gi_worlds', [
      {
        name: 'Adult / No-Gi / Male / Advanced / Light',
        discipline: 'nogi',
        beltRank: null,
        ruleset: 'adcc',
        format: 'double_elimination',
        registeredCount: 28,
        capacity: 32,
      },
      {
        name: 'Adult / No-Gi / Female / Advanced / Feather',
        discipline: 'nogi',
        gender: 'female',
        beltRank: null,
        ruleset: 'adcc',
        registeredCount: 16,
        capacity: 16,
      },
      {
        name: 'Adult / No-Gi / Male / Beginner / Middle',
        discipline: 'nogi',
        beltRank: null,
        ruleset: 'submission_only',
        registeredCount: 22,
        capacity: 32,
      },
      {
        name: 'Black Belt Absolute (Superfight)',
        discipline: 'nogi',
        beltRank: 'black',
        ruleset: 'submission_only',
        format: 'round_robin',
        registeredCount: 8,
        capacity: 8,
        priceCents: usd(0),
      },
    ]),
  },
  {
    id: 'evt_london_invitational',
    slug: 'london-gi-invitational-2026',
    name: 'London Gi Invitational',
    venueName: 'Copper Box Arena',
    address: 'Queen Elizabeth Olympic Park',
    city: 'London',
    country: 'United Kingdom',
    coordinates: { latitude: 51.5462, longitude: -0.0156 },
    startDate: daysFromToday(62),
    endDate: daysFromToday(62),
    registrationOpensAt: daysFromToday(5),
    registrationClosesAt: daysFromToday(55),
    status: 'published',
    coverImageUrl: null,
    disciplines: ['gi'],
    rulesets: ['ibjjf'],
    divisionCount: 4,
    registeredCount: 64,
    startingPriceCents: usd(70),
    description:
      'An IBJJF-ruleset gi tournament bringing together the UK and European competition scene under one roof.',
    scheduleNote: 'Single day. Registration opens soon.',
    organizer: {
      id: 'org_ukbjjf',
      slug: 'uk-grappling-league',
      name: 'UK Grappling League',
      logoUrl: null,
    },
    divisions: divisions('evt_london_invitational', [
      {
        name: 'Adult / Gi / Male / White / Light',
        beltRank: 'white',
        registeredCount: 18,
        capacity: 32,
      },
      {
        name: 'Adult / Gi / Male / Blue / Middle',
        beltRank: 'blue',
        registeredCount: 20,
        capacity: 32,
      },
      {
        name: 'Adult / Gi / Female / Blue-Purple / Open',
        gender: 'female',
        beltRank: 'purple',
        registeredCount: 10,
        capacity: 16,
      },
      {
        name: 'Juvenile / Gi / Male / Blue / Feather',
        ageCategory: 'Juvenile',
        beltRank: 'blue',
        registeredCount: 8,
        capacity: 16,
      },
    ]),
  },
  {
    id: 'evt_kids_classic',
    slug: 'norcal-kids-classic-2026',
    name: 'NorCal Kids Classic',
    venueName: 'San Jose State Event Center',
    address: '290 South 7th St',
    city: 'San Jose',
    country: 'United States',
    coordinates: { latitude: 37.3352, longitude: -121.8811 },
    startDate: daysFromToday(0),
    endDate: daysFromToday(0),
    registrationOpensAt: daysFromToday(-40),
    registrationClosesAt: daysFromToday(-2),
    status: 'in_progress',
    coverImageUrl: null,
    disciplines: ['gi'],
    rulesets: ['ibjjf'],
    divisionCount: 3,
    registeredCount: 156,
    startingPriceCents: usd(55),
    description:
      'A friendly, well-run kids and juvenile gi tournament — happening today. Follow the live mat schedule and results.',
    scheduleNote: 'Check-in opens 7:30am. Coaches meeting at 8:15am.',
    organizer: { id: 'org_openmat', slug: 'openmat-events', name: 'OpenMat Events', logoUrl: null },
    divisions: divisions('evt_kids_classic', [
      {
        name: 'Kids / Gi / Male / Gray / 6-7yo',
        beltRank: 'gray',
        ageCategory: 'Kids',
        registeredCount: 40,
        capacity: 64,
      },
      {
        name: 'Kids / Gi / Female / Yellow / 8-9yo',
        gender: 'female',
        beltRank: 'yellow',
        ageCategory: 'Kids',
        registeredCount: 28,
        capacity: 32,
      },
      {
        name: 'Juvenile / Gi / Male / Green / 12-13yo',
        beltRank: 'green',
        ageCategory: 'Juvenile',
        registeredCount: 22,
        capacity: 32,
      },
    ]),
  },
  {
    id: 'evt_sao_paulo_open',
    slug: 'sao-paulo-international-open-2026',
    name: 'São Paulo International Open',
    venueName: 'Ginásio do Ibirapuera',
    address: 'R. Manoel da Nóbrega, 1361',
    city: 'São Paulo',
    country: 'Brazil',
    coordinates: { latitude: -23.5872, longitude: -46.6553 },
    startDate: daysFromToday(-21),
    endDate: daysFromToday(-20),
    registrationOpensAt: daysFromToday(-90),
    registrationClosesAt: daysFromToday(-28),
    status: 'completed',
    coverImageUrl: null,
    disciplines: ['gi', 'nogi'],
    rulesets: ['ibjjf'],
    divisionCount: 5,
    registeredCount: 412,
    startingPriceCents: usd(60),
    description:
      'A completed major international open. Results and final brackets are published per division.',
    scheduleNote: 'Event complete — view results by division.',
    organizer: {
      id: 'org_cbjj',
      slug: 'sp-grappling-federation',
      name: 'SP Grappling Federation',
      logoUrl: null,
    },
    divisions: divisions('evt_sao_paulo_open', [
      {
        name: 'Adult / Gi / Male / Black / Feather',
        beltRank: 'black',
        registeredCount: 16,
        capacity: 16,
      },
      {
        name: 'Adult / Gi / Female / Black / Light',
        gender: 'female',
        beltRank: 'black',
        registeredCount: 12,
        capacity: 16,
      },
      {
        name: 'Adult / No-Gi / Male / Black / Middle',
        discipline: 'nogi',
        beltRank: 'black',
        registeredCount: 14,
        capacity: 16,
      },
      {
        name: 'Adult / Gi / Male / Brown / Heavy',
        beltRank: 'brown',
        registeredCount: 15,
        capacity: 16,
      },
      {
        name: 'Masters 2 / Gi / Male / Purple / Open',
        ageCategory: 'Masters 2',
        beltRank: 'purple',
        registeredCount: 10,
        capacity: 16,
      },
    ]),
  },
  {
    id: 'evt_austin_submission',
    slug: 'austin-submission-only-2026',
    name: 'Austin Submission Only',
    venueName: 'Palmer Events Center',
    address: '900 Barton Springs Rd',
    city: 'Austin',
    country: 'United States',
    coordinates: { latitude: 30.2596, longitude: -97.7561 },
    startDate: daysFromToday(31),
    endDate: daysFromToday(31),
    registrationOpensAt: daysFromToday(-5),
    registrationClosesAt: daysFromToday(26),
    status: 'registration_open',
    coverImageUrl: null,
    disciplines: ['nogi'],
    rulesets: ['submission_only', 'ebi'],
    divisionCount: 3,
    registeredCount: 78,
    startingPriceCents: usd(80),
    description:
      'A pure submission-only no-gi event using EBI overtime to break ties. No points, no advantages — finish or go to overtime.',
    scheduleNote: 'EBI overtime rules. No-time-limit finals for black belt.',
    organizer: { id: 'org_atx', slug: 'atx-grappling', name: 'ATX Grappling', logoUrl: null },
    divisions: divisions('evt_austin_submission', [
      {
        name: 'Adult / No-Gi / Male / Advanced / Light',
        discipline: 'nogi',
        beltRank: null,
        ruleset: 'ebi',
        registeredCount: 24,
        capacity: 32,
      },
      {
        name: 'Adult / No-Gi / Male / Intermediate / Middle',
        discipline: 'nogi',
        beltRank: null,
        ruleset: 'submission_only',
        registeredCount: 30,
        capacity: 32,
      },
      {
        name: 'Adult / No-Gi / Female / Advanced / Open',
        discipline: 'nogi',
        gender: 'female',
        beltRank: null,
        ruleset: 'ebi',
        registeredCount: 12,
        capacity: 16,
      },
    ]),
  },
];

// --- Cross-links: registrations, achievements ------------------------------

// Place athletes into specific events/divisions so account and profile pages
// have history to render.
interface RegistrationSeed {
  athleteId: string;
  eventId: string;
  divisionIndex: number;
  status: RegistrationSummary['status'];
}

const registrationSeeds: RegistrationSeed[] = [
  { athleteId: 'ath_costa', eventId: 'evt_summer_open', divisionIndex: 3, status: 'confirmed' },
  { athleteId: 'ath_costa', eventId: 'evt_sao_paulo_open', divisionIndex: 0, status: 'checked_in' },
  { athleteId: 'ath_haddad', eventId: 'evt_summer_open', divisionIndex: 1, status: 'confirmed' },
  {
    athleteId: 'ath_haddad',
    eventId: 'evt_austin_submission',
    divisionIndex: 1,
    status: 'pending',
  },
  {
    athleteId: 'ath_nguyen',
    eventId: 'evt_austin_submission',
    divisionIndex: 0,
    status: 'confirmed',
  },
  { athleteId: 'ath_nguyen', eventId: 'evt_no_gi_worlds', divisionIndex: 0, status: 'waitlisted' },
  { athleteId: 'ath_silva', eventId: 'evt_sao_paulo_open', divisionIndex: 1, status: 'checked_in' },
  {
    athleteId: 'ath_okafor',
    eventId: 'evt_london_invitational',
    divisionIndex: 1,
    status: 'confirmed',
  },
  {
    athleteId: 'ath_park',
    eventId: 'evt_london_invitational',
    divisionIndex: 2,
    status: 'confirmed',
  },
  { athleteId: 'ath_mendoza', eventId: 'evt_no_gi_worlds', divisionIndex: 3, status: 'confirmed' },
  { athleteId: 'ath_tanaka', eventId: 'evt_summer_open', divisionIndex: 2, status: 'confirmed' },
];

for (const seed of registrationSeeds) {
  const athlete = athletes.find((a) => a.id === seed.athleteId);
  const event = events.find((e) => e.id === seed.eventId);
  if (!athlete || !event) continue;
  const division = event.divisions[seed.divisionIndex];
  if (!division) continue;
  athlete.registrations.push({
    id: `${seed.athleteId}_${seed.eventId}_${seed.divisionIndex}`,
    eventId: event.id,
    eventName: event.name,
    eventSlug: event.slug,
    divisionName: division.name,
    status: seed.status,
    startDate: event.startDate,
    city: event.city,
  });
}

// Give each athlete a believable podium history derived from their record,
// spread across real events. Gold count comes straight from the record; silver
// and bronze are scaled from it so medal shelves and recent-results lists feel
// lived-in on both athlete and academy profiles.
athletes.forEach((athlete, idx) => {
  const gold = Math.min(athlete.record.goldMedals, 12);
  const silver = Math.round(athlete.record.goldMedals * 0.5);
  const bronze = Math.round(athlete.record.goldMedals * 0.35);
  const places = [
    ...Array<number>(gold).fill(1),
    ...Array<number>(silver).fill(2),
    ...Array<number>(bronze).fill(3),
  ];
  places.forEach((place, i) => {
    const event = events[(idx * 3 + i) % events.length]!;
    const division = event.divisions[i % Math.max(1, event.divisions.length)];
    athlete.achievements.push({
      eventName: event.name,
      eventSlug: event.slug,
      divisionName: division?.name ?? 'Adult / Open',
      place,
      date: event.startDate,
    });
  });
});

// Populate each academy's roster and aggregate its members' podium results.
for (const academy of academies) {
  const members = athletes.filter((a) => a.academyId === academy.id);
  academy.athletes = members.map((a) => ({
    id: a.id,
    slug: a.slug,
    firstName: a.firstName,
    lastName: a.lastName,
    beltRank: a.beltRank,
    discipline: a.discipline,
    academyId: a.academyId,
    academyName: a.academyName,
    academySlug: a.academySlug,
    country: a.country,
    avatarUrl: a.avatarUrl,
  }));
  academy.achievements = members.flatMap((a) => a.achievements);
}

// --- The signed-in user (account pages) ------------------------------------

export const currentAccountAthleteId = 'ath_haddad';

/** The organizer the demo account manages, for the organizer dashboard. */
export const currentOrganizerId = 'org_openmat';
export const currentOrganizer = {
  id: 'org_openmat',
  slug: 'openmat-events',
  name: 'OpenMat Events',
  logoUrl: null as string | null,
};

/** Make a URL-safe slug, with a short suffix to avoid collisions. */
export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'event'}-${Math.random().toString(36).slice(2, 6)}`;
}
