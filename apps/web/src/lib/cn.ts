/**
 * Tiny className combiner. Filters out falsey values so conditional classes can
 * be written inline without pulling in a dependency.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
