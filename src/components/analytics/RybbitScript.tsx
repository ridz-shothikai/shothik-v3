'use client';

import { useEffect } from 'react';

export default function RybbitScript() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prevent duplicate insertion
    const existing = document.querySelector('script[data-site-id="7e1390f29be4"]');
    if (existing) return () => {};

    const s = document.createElement('script');
    s.src = 'https://rybbit.shothik.live/api/script.js';
    s.defer = true;
    s.setAttribute('data-site-id', '7e1390f29be4');
    document.head.appendChild(s);

    return () => {
      // cleanup: remove the script if component unmounts
      try {
        if (s && s.parentNode) s.parentNode.removeChild(s);
      } catch (e) {}
    };
  }, []);

  return null;
}
