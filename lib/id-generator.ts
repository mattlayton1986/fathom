/**
 * Generates a stable, deterministic node ID from its access path.
 * IDs are stable for the lifetime of a single parse result and reset on re-parse.
 */
export function generateId(path: string): string {
  return `node:${path}`;
}