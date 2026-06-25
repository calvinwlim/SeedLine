import type { BracketEntrant, DivisionSummary } from '@seedline/types';
import { academies, athletes, events } from './data';

/**
 * Deterministic entrant generation for a division's bracket. Real athletes who
 * registered for the division are seeded first (so brackets reference actual
 * profiles), then the field is filled with stable, seeded pseudo-competitors so
 * every division has a believable bracket to render.
 */

const FIRST_NAMES = [
  'Lucas',
  'Marcus',
  'Diego',
  'Kenji',
  'Omar',
  'Liam',
  'Noah',
  'Mateo',
  'Hugo',
  'Ravi',
  'Sofia',
  'Maya',
  'Ana',
  'Yuki',
  'Lena',
  'Carla',
  'Nadia',
  'Ivy',
  'Tariq',
  'Bruno',
];

const LAST_NAMES = [
  'Almeida',
  'Tanaka',
  'Costa',
  'Ferreira',
  'Khan',
  'Silva',
  'Nakamura',
  'Oliveira',
  'Reyes',
  'Petrov',
  'Santos',
  'Lima',
  'Haddad',
  'Kim',
  'Rossi',
  'Mendes',
  'Dubois',
  'Novak',
  'Abadi',
  'Cruz',
];

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small, fast, seeded PRNG so generated fields are stable across reloads. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(list: readonly T[], rand: () => number, fallback: T): T {
  return list[Math.floor(rand() * list.length)] ?? fallback;
}

export function buildEntrants(eventSlug: string, division: DivisionSummary): BracketEntrant[] {
  const event = events.find((e) => e.slug === eventSlug);
  const cap = division.format === 'round_robin' ? 6 : 16;
  const count = Math.max(2, Math.min(division.registeredCount, cap));
  const rand = mulberry32(hashString(division.id));
  const entrants: BracketEntrant[] = [];

  // Seed real registered athletes first.
  if (event) {
    const registered = athletes.filter((a) =>
      a.registrations.some((r) => r.eventSlug === eventSlug && r.divisionName === division.name),
    );
    for (const a of registered) {
      if (entrants.length >= count) break;
      entrants.push({
        id: a.id,
        name: `${a.firstName} ${a.lastName}`,
        seed: entrants.length + 1,
        academyId: a.academyId,
        academyName: a.academyName,
      });
    }
  }

  // Fill the rest of the field with deterministic pseudo-competitors.
  while (entrants.length < count) {
    const academy = pick(academies, rand, academies[0]!);
    const first = pick(FIRST_NAMES, rand, 'Alex');
    const last = pick(LAST_NAMES, rand, 'Costa');
    entrants.push({
      id: `${division.id}_e${entrants.length + 1}`,
      name: `${first} ${last}`,
      seed: entrants.length + 1,
      academyId: academy.id,
      academyName: academy.name,
    });
  }

  return entrants;
}
