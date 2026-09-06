import { MouseEvent, useId, useRef, useState } from "react";
import HighlightedText from './HighlightedText';
import styles from './NodeKey.module.scss';

interface NodeKeyProps {
  path: string;
  label: string | number;
  searchQuery: string;
  isMatch: boolean;
}

export default function NodeKey({ path, label, searchQuery, isMatch }: NodeKeyProps) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();
  const isLongKey = typeof label === 'string' && Array.from(label).length > 32;

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await navigator.clipboard.writeText(path);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCopied(true);

    timeoutRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 1500);

  }

  return (
    <span className={isLongKey
      ? `${styles['node-key']} ${styles['long-key']}`
      : styles['node-key']}
    >
      <button
        type="button"
        aria-describedby={tooltipId}
        onClick={handleCopy}
        onMouseDown={(e) => e.preventDefault()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <HighlightedText
          text={label}
          searchQuery={searchQuery}
          isMatch={isMatch}
        />
      </button>
      <span className={isCopied ? styles.copied : undefined} role="tooltip" id={tooltipId}>{isCopied ? 'Copied!' : path}</span>
    </span>
  );
}