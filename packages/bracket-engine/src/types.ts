/**
 * Core domain types for the bracket engine.
 *
 * Everything here is plain data (no classes, no I/O) so a bracket can be
 * serialized to JSON, stored in Postgres, shipped to a tablet, and
 * reconstructed identically on either side.
 */

export type BracketFormat = 'single_elimination' | 'double_elimination' | 'round_robin';

export interface Entrant {
  /** Stable unique id (typically the registration id). */
  id: string;
  /** Optional seed; 1 is the top seed. If omitted, input order is used. */
  seed?: number;
  /** Academy/team id, used to keep teammates apart in early rounds. */
  academyId?: string;
  /** Display label, for convenience only. */
  name?: string;
}

/** Describes where a competitor in a match slot comes from. */
export type SlotSource =
  | { kind: 'entrant'; entrantId: string }
  | { kind: 'bye' }
  | { kind: 'winner_of'; matchId: string }
  | { kind: 'loser_of'; matchId: string }
  | { kind: 'pending' };

export type SubBracket = 'winners' | 'losers' | 'final' | 'round_robin';

export interface BracketMatch {
  /** Stable id within the bracket, e.g. "W-R1-M1" or "RR-R2-M1". */
  id: string;
  bracketType: SubBracket;
  /** 1-indexed round within the sub-bracket. */
  round: number;
  /** 1-indexed position of the match within its round. */
  position: number;
  /** Source feeding side A. */
  sideA: SlotSource;
  /** Source feeding side B. */
  sideB: SlotSource;
  /** Resolved entrant id on side A, once known. */
  entrantA: string | null;
  /** Resolved entrant id on side B, once known. */
  entrantB: string | null;
  /** Winner entrant id, once decided. */
  winnerId: string | null;
  /** Loser entrant id, once decided (null for a bye). */
  loserId: string | null;
  /** Where the winner advances. */
  winnerTo: AdvanceTarget | null;
  /** Where the loser advances (double elimination / bronze match). */
  loserTo: AdvanceTarget | null;
}

export interface AdvanceTarget {
  matchId: string;
  side: 'A' | 'B';
}

export interface Bracket {
  format: BracketFormat;
  entrants: Entrant[];
  matches: BracketMatch[];
  /** Total rounds in the primary bracket. */
  rounds: number;
}

export interface GenerateOptions {
  /**
   * Best-effort: keep entrants from the same academy apart in round one by
   * swapping slots after standard seed placement. Does not guarantee
   * separation when too many entrants share an academy.
   */
  separateAcademies?: boolean;
}

export class BracketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BracketError';
  }
}
