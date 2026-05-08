
'use client';

import { useEffect } from 'react';

export function PWARegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('BioMedLink PWA: ServiceWorker registration successful');
          })
          .catch((err) => {
            console.warn('BioMedLink PWA: ServiceWorker registration failed: ', err);
          });
      });
    }
  }, []);

  return null;
}
