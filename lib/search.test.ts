import { describe, expect, it } from 'vitest';
import buildTree from './parser';
import { computeMatches } from './search';

describe('computeMatches', () => {
  it('returns a direct key match and its ancestor separately', () => {
    const parsed = buildTree('{"displayName": "Ada"}');

    expect(parsed.ok).toBe(true);
    if (!parsed.ok || parsed.value.kind !== 'object') return;

    const displayNameNode = parsed.value.children[0];

    expect(displayNameNode).toBeDefined();
    if (!displayNameNode) return;

    const matches = computeMatches('DISPLAY', parsed.value);

    expect(matches.matchIds).toEqual(new Set([displayNameNode.id]));
    expect(matches.ancestorIds).toEqual(new Set([parsed.value.id]));
  });

  it('returns a direct string-value match and its ancestor separately', () => {
    // although test uses a string value, it handles every primitive JSON
    // value since search matches against stringified values
    const parsed = buildTree('{"displayName": "Ada Lovelace"}');

    expect(parsed.ok).toBe(true);
    if (!parsed.ok || parsed.value.kind !== 'object') return;

    const displayNameNode = parsed.value.children[0];

    expect(displayNameNode).toBeDefined();
    if (!displayNameNode) return;

    const matches = computeMatches('LOVELACE', parsed.value);

    expect(matches.matchIds).toEqual(new Set([displayNameNode.id]));
    expect(matches.ancestorIds).toEqual(new Set([parsed.value.id]));
  });
});