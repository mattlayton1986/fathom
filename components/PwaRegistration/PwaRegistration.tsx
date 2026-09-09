'use client';

import { useEffect } from 'react';
import { deploymentBasePath } from '@/lib/deployment';

export default function PwaRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production'
      || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register(`${deploymentBasePath}/sw.js`).catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  }, []);

  return null;
}