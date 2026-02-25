'use client';

import { useEffect, useRef } from 'react';
import { useMonitoringStore } from '../hooks/useMonitoring';

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const updateWebsiteStatus = useMonitoringStore((state) => state.updateWebsiteStatus);
  const isPollingRef = useRef(false);

  useEffect(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    const checkStatus = async (id: string, url: string) => {
      const startTime = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        await fetch(url, {
          mode: 'no-cors',
          signal: controller.signal,
          cache: 'no-store',
        });

        clearTimeout(timeoutId);
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        updateWebsiteStatus(id, {
          timestamp: Date.now(),
          status: 'online',
          responseTime,
        });
      } catch (error: any) {
        clearTimeout(timeoutId);
        const isTimeout = error.name === 'AbortError';
        updateWebsiteStatus(id, {
          timestamp: Date.now(),
          status: isTimeout ? 'offline' : 'error',
          responseTime: null,
        });
      }
    };

    const poll = async () => {
      const currentWebsites = useMonitoringStore.getState().websites;
      const promises = currentWebsites.map((site) => checkStatus(site.id, site.url));
      await Promise.allSettled(promises);
    };

    // Initial poll
    poll();

    const intervalId = setInterval(poll, 5000);

    return () => {
      clearInterval(intervalId);
      isPollingRef.current = false;
    };
  }, [updateWebsiteStatus]);

  return <>{children}</>;
}
