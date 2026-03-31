'use client';

import { type Theme, useTheme } from '@/hooks/useTheme';
import styles from './ThemeToggle.module.scss';

const options: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={styles.toggle} role="group" aria-label="Color theme">
      {options.map(({ value, label }) => (
        <button
          key={value}
          className={`${styles.option} ${theme === value ? styles.active : ''}`}
          onClick={() => setTheme(value)}
          aria-pressed={theme === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
}