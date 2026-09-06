const graphemeSegmenter = new Intl.Segmenter(undefined, {
  granularity: 'grapheme',
});

function getGraphemes(value: string): string[] {
  return [...graphemeSegmenter.segment(value)].map(({ segment }) => segment);
}

export function countGraphemes(value: string): number {
  return getGraphemes(value).length;
}

export function sliceGraphemes(value: string, start: number, end?: number): string {
  return getGraphemes(value).slice(start, end).join('');
}