'use client';

import { useEffect, useRef } from 'react';
import { useMonitoringStore } from '../hooks/useMonitoring';

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const connectSocket = useMonitoringStore((state) => state.connectSocket);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (isConnectedRef.current) return;
    isConnectedRef.current = true;
    connectSocket();
  }, [connectSocket]);

  return <>{children}</>;
}
