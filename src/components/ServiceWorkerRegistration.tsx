'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // Get base path for GitHub Pages
      const basePath = process.env.NEXT_PUBLIC_REPO_NAME 
        ? `/${process.env.NEXT_PUBLIC_REPO_NAME}` 
        : '';
      
      const swUrl = `${basePath}/sw.js?basePath=${encodeURIComponent(basePath)}`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('SW registered:', registration.scope);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  return null;
}
