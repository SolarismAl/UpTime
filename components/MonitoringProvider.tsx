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
  }, [initializeListeners]);

  return <>{children}</>;
}
