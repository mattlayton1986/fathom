import { describe, expect, it } from 'vitest';
import buildTree from './parser';
import { computeMatches } from './search';

describe('computeMatches', () => {
  it("returns a direct key match and its ancestor separately", () => {
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
});