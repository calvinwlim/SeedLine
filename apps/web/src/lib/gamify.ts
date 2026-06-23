import type { AthleteRecord, AthleteSummary, BeltRank, MedalResult } from '@openmat/types';

/** Headline performance numbers derived from a competition record. */
export interface KeyStats {
  matches: number;
  wins: number;
  losses: number;
  submissions: number;
  /** Wins as a percentage of matches. */
  winRate: number;
  /** Submissions as a percentage of wins (how often a win is a finish). */
  finishRate: number;
}

export function deriveKeyStats(record: AthleteRecord): KeyStats {
  const winRate = record.matches > 0 ? Math.round((record.wins / record.matches) * 100) : 0;
  const finishRate = record.wins > 0 ? Math.round((record.submissions / record.wins) * 100) : 0;
  return {
    matches: record.matches,
    wins: record.wins,
    losses: record.losses,
    submissions: record.submissions,
    winRate,
    finishRate,
  };
}

export interface MedalCounts {
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

/** Tally a list of podium results into gold / silver / bronze counts. */
export function countMedals(achievements: MedalResult[]): MedalCounts {
  const gold = achievements.filter((m) => m.place === 1).length;
  const silver = achievements.filter((m) => m.place === 2).length;
  const bronze = achievements.filter((m) => m.place === 3).length;
  return { gold, silver, bronze, total: gold + silver + bronze };
}

/** Gold comes from the aggregate record; silver/bronze from podium history. */
export function deriveMedals(record: AthleteRecord, achievements: MedalResult[]): MedalCounts {
  const counted = countMedals(achievements);
  const gold = Math.max(record.goldMedals, counted.gold);
  return { gold, silver: counted.silver, bronze: counted.bronze, total: gold + counted.silver + counted.bronze };
}

/** Most-recent-first podium results, capped for display. */
export function recentMedals(achievements: MedalResult[], limit = 8): MedalResult[] {
  return [...achievements]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.place - b.place))
    .slice(0, limit);
}

export interface TeamStats {
  members: number;
  competitors: number;
  blackBelts: number;
  podiums: number;
}

export function deriveTeamStats(roster: AthleteSummary[], achievements: MedalResult[]): TeamStats {
  return {
    members: roster.length,
    competitors: roster.length,
    blackBelts: roster.filter((a) => a.beltRank === 'black').length,
    podiums: achievements.length,
  };
}

const BELT_ORDER: BeltRank[] = ['white', 'blue', 'purple', 'brown', 'black'];

export interface BeltSegment {
  rank: BeltRank;
  count: number;
}

/** Belt composition of a roster, ordered white → black, dropping empty ranks. */
export function beltBreakdown(roster: AthleteSummary[]): BeltSegment[] {
  return BELT_ORDER.map((rank) => ({
    rank,
    count: roster.filter((a) => a.beltRank === rank).length,
  })).filter((segment) => segment.count > 0);
}

export type BadgeIcon =
  | 'flame'
  | 'bolt'
  | 'trophy'
  | 'medal'
  | 'shield'
  | 'belt'
  | 'target'
  | 'crown';

export interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: BadgeIcon;
  /** Accent family used when unlocked. */
  tone: 'gold' | 'win' | 'corner';
  earned: boolean;
  /** Progress toward unlocking, for locked badges. */
  progress?: { current: number; target: number };
}

interface AchievementInput {
  record: AthleteRecord;
  achievements: MedalResult[];
  isBlackBelt: boolean;
}

/**
 * Derive the collectible achievement set from a competitor's record. Earned
 * badges light up; locked ones show how close the athlete is, which is what
 * makes building a profile feel rewarding.
 */
export function deriveAchievements({
  record,
  achievements,
  isBlackBelt,
}: AchievementInput): Achievement[] {
  const medals = deriveMedals(record, achievements);
  const clamp = (current: number, target: number) => ({
    current: Math.min(current, target),
    target,
  });

  const defs: Achievement[] = [
    {
      id: 'first-win',
      label: 'First blood',
      description: 'Win your first match',
      icon: 'flame',
      tone: 'corner',
      earned: record.wins >= 1,
      progress: clamp(record.wins, 1),
    },
    {
      id: 'finisher',
      label: 'Finisher',
      description: '10 submissions',
      icon: 'bolt',
      tone: 'win',
      earned: record.submissions >= 10,
      progress: clamp(record.submissions, 10),
    },
    {
      id: 'sub-machine',
      label: 'Submission machine',
      description: '40 submissions',
      icon: 'target',
      tone: 'win',
      earned: record.submissions >= 40,
      progress: clamp(record.submissions, 40),
    },
    {
      id: 'iron',
      label: 'Iron athlete',
      description: '50 matches',
      icon: 'shield',
      tone: 'gold',
      earned: record.matches >= 50,
      progress: clamp(record.matches, 50),
    },
    {
      id: 'centurion',
      label: 'Centurion',
      description: '100 matches',
      icon: 'shield',
      tone: 'gold',
      earned: record.matches >= 100,
      progress: clamp(record.matches, 100),
    },
    {
      id: 'podium-regular',
      label: 'Podium regular',
      description: '5 podiums',
      icon: 'medal',
      tone: 'gold',
      earned: medals.total >= 5,
      progress: clamp(medals.total, 5),
    },
    {
      id: 'gold-standard',
      label: 'Gold standard',
      description: '10 gold medals',
      icon: 'trophy',
      tone: 'gold',
      earned: medals.gold >= 10,
      progress: clamp(medals.gold, 10),
    },
    {
      id: 'black-belt',
      label: 'Black belt',
      description: 'Reach black belt',
      icon: 'belt',
      tone: 'corner',
      earned: isBlackBelt,
    },
  ];

  // Earned first, then closest-to-unlocking, so the grid reads as a progression.
  return defs.sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    const ap = a.progress ? a.progress.current / a.progress.target : 0;
    const bp = b.progress ? b.progress.current / b.progress.target : 0;
    return bp - ap;
  });
}
