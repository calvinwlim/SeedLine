import type { BeltRank, EventStatus, RegistrationStatus } from '@seedline/types';

/** Format a single date, e.g. "Jul 10, 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format a start–end range, collapsing single-day events to one date. */
export function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) return formatDate(startIso);

  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    const month = start.toLocaleDateString(undefined, { month: 'short' });
    return `${month} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
  }
  return `${formatDate(startIso)} – ${formatDate(endIso)}`;
}

/** Money from integer cents, e.g. 8500 -> "$85". Free is "Free". */
export function formatPrice(cents: number, currency = 'USD'): string {
  if (cents === 0) return 'Free';
  const value = cents / 100;
  const fractionDigits = cents % 100 === 0 ? 0 : 2;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Days until a future date; negative if past. */
export function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}

/** Title-case an enum-ish string: "registration_open" -> "Registration Open". */
export function humanize(value: string): string {
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  registration_open: 'Registration open',
  registration_closed: 'Registration closed',
  in_progress: 'Live now',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function eventStatusLabel(status: EventStatus): string {
  return EVENT_STATUS_LABELS[status] ?? humanize(status);
}

/** Map an event status to a Badge tone. */
export function eventStatusTone(status: EventStatus): 'gold' | 'green' | 'red' | 'muted' {
  switch (status) {
    case 'registration_open':
      return 'green';
    case 'in_progress':
      return 'gold';
    case 'cancelled':
      return 'red';
    case 'registration_closed':
    case 'completed':
    case 'draft':
    case 'published':
    default:
      return 'muted';
  }
}

const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending: 'Pending payment',
  confirmed: 'Confirmed',
  waitlisted: 'Waitlisted',
  withdrawn: 'Withdrawn',
  checked_in: 'Checked in',
};

export function registrationStatusLabel(status: RegistrationStatus): string {
  return REGISTRATION_STATUS_LABELS[status] ?? humanize(status);
}

export function registrationStatusTone(
  status: RegistrationStatus,
): 'gold' | 'green' | 'red' | 'muted' {
  switch (status) {
    case 'confirmed':
    case 'checked_in':
      return 'green';
    case 'pending':
    case 'waitlisted':
      return 'gold';
    case 'withdrawn':
      return 'red';
    default:
      return 'muted';
  }
}

/** Hex color for a BJJ belt, for the belt indicator. */
export function beltColor(belt: BeltRank): string {
  const colors: Record<BeltRank, string> = {
    white: '#e9edf2',
    gray: '#9aa3ad',
    yellow: '#f2cf3f',
    orange: '#ed8a3c',
    green: '#3fae6b',
    blue: '#3a73d6',
    purple: '#8a55c9',
    brown: '#7a4a2b',
    black: '#1b1f24',
  };
  return colors[belt];
}

/** Ordinal place label: 1 -> "1st", 2 -> "2nd". */
export function ordinalPlace(place: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'] as const;
  const v = place % 100;
  const suffix = suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0];
  return `${place}${suffix}`;
}

export function fullName(first: string, last: string): string {
  return `${first} ${last}`.trim();
}

export function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}
