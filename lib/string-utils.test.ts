import { describe, expect, it } from 'vitest';
import { countGraphemes, sliceGraphemes } from './string-utils';

describe('Unicode text helpers', () => {
  it('counts an emoji as one visible character', () => {
    expect(countGraphemes('a🚀b')).toBe(3);
  });

  it('does not split an emoji at a preview boundary', () => {
    const value = `${'a'.repeat(79)}🚀more`;

    expect(sliceGraphemes(value, 0, 80)).toBe(`${'a'.repeat(79)}🚀`);
  });

  it('does not split a multi-code-point emoji', () => {
    const family = '👨‍👩‍👧‍👦';

    expect(sliceGraphemes(`a${family}b`, 0, 2)).toBe(`a${family}`);
  });
})