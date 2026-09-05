import styles from './HighlightedText.module.scss';

type HighlightedTextProps = {
  text: string | number;
  searchQuery: string;
  isMatch: boolean;
}

export default function HighlightedText({
  text,
  searchQuery,
  isMatch
}: Omit<HighlightedTextProps, 'path'>) {
  const displayText = String(text);

  if (!isMatch || !searchQuery) {
    return displayText;
  }

  const normalizedText = displayText.toLowerCase();
  const normalizedQuery = searchQuery.toLowerCase();
  const parts = [];
  let startIndex = 0;
  let matchIndex = normalizedText.indexOf(normalizedQuery, startIndex);

  while (matchIndex !== -1) {
    if (matchIndex > startIndex) {
      parts.push(displayText.slice(startIndex, matchIndex));
    }

    const endIndex = matchIndex + normalizedQuery.length;

    parts.push(
      <mark className={styles.match} key={matchIndex}>
        {displayText.slice(matchIndex, endIndex)}
      </mark>
    );

    startIndex = endIndex;
    matchIndex = normalizedText.indexOf(normalizedQuery, startIndex);
  }

  if (startIndex < displayText.length) {
    parts.push(displayText.slice(startIndex));
  }

  return parts;
}