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
    // Confirms case-insensitive matching against a string primitive value.
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

  it('matches a number through its stringified value', () => {
    const parsed = buildTree('{"statusCode": 404}');

    expect(parsed.ok).toBe(true);
    if (!parsed.ok || parsed.value.kind !== 'object') return;

    const statusCodeNode = parsed.value.children[0];

    expect(statusCodeNode).toBeDefined();
    if (!statusCodeNode) return;

    const matches = computeMatches('404', parsed.value);

    expect(matches.matchIds).toEqual(new Set([statusCodeNode.id]));
    expect(matches.ancestorIds).toEqual(new Set([parsed.value.id]));
  });

  it("collects every ancestor of a nested value match", () => {
    const parsed = buildTree('{"user": {"email": "ada@example.com"}}');

    expect(parsed.ok).toBe(true);
    if (!parsed.ok || parsed.value.kind !== 'object') return;

    const userNode = parsed.value.children[0];

    expect(userNode).toBeDefined();
    expect(userNode?.kind).toBe('object');

    if (!userNode || userNode.kind !== 'object') return;

    const emailNode = userNode.children[0];

    expect(emailNode).toBeDefined();
    if (!emailNode) return;

    const matches = computeMatches('example.com', parsed.value);

    expect(matches.matchIds).toEqual(new Set([emailNode.id]));
    expect(matches.ancestorIds).toEqual(
      new Set([parsed.value.id, userNode.id])
    );
  });

  it('returns no matches when neither a key nor value contains the query', () => {
    const parsed = buildTree('{"displayName": "Ada"}');

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const matches = computeMatches('dracula', parsed.value);

    expect(matches.matchIds).toEqual(new Set<string>());
    expect(matches.ancestorIds).toEqual(new Set<string>());
  });

  it('returns no matches for an empty query', () => {
    const parsed = buildTree('{"displayName": "Ada"}');

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const matches = computeMatches('', parsed.value);

    expect(matches.matchIds).toEqual(new Set<string>());
    expect(matches.ancestorIds).toEqual(new Set<string>());
  });
});