'use client';

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'system';
  });

  useEffect(() => {
    const apply = (t: Theme) => {
      const isLight = t === 'light' ||
        (t === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isLight) {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }

    apply(theme);
    localStorage.setItem('theme', theme);

    // Handle case where user changes OS theme while app is running
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) =>
        e.matches
          ? document.documentElement.removeAttribute('data-theme')
          : document.documentElement.setAttribute('data-theme', 'light');
      mq.addEventListener('change', handler);

      // cleanup: remove listener when toggle changes away from 'system'
      // or component unmounts
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  return { theme, setTheme };
}