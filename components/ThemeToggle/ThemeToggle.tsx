'use client';

import { useState, useEffect } from 'react';
import { type Theme, useTheme } from '@/hooks/useTheme';
import styles from './ThemeToggle.module.scss';

const options: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={styles.toggle} role="group" aria-label="Color theme">
      {options.map(({ value, label }) => (
        <button
          key={value}
          className={`${styles.option} ${mounted && theme === value ? styles.active : ''}`}
          onClick={() => setTheme(value)}
          aria-pressed={mounted ? theme === value : false}
        >
          {label}
        </button>
      ))}
    </div>
  );
}