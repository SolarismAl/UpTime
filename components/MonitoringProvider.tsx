'use client';

import { useEffect, useRef } from 'react';
import { useMonitoringStore } from '../hooks/useMonitoring';

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const initializeListeners = useMonitoringStore((state) => state.initializeListeners);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    initializeListeners();

    // Hybrid Architecture: Fast 3-second polling while the dashboard is open!
    // This provides real-time checks when you are looking at the screen,
    // and your external 1-minute Cronjob handles it when the tab is closed.
    const pollId = setInterval(() => {
      fetch('/api/cron').catch((err) => console.error('Dashboard poll error:', err));
    }, 3000);

    return () => clearInterval(pollId);
  }, [initializeListeners]);

  return <>{children}</>;
}
