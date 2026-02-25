import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Website, Incident, Status, CheckResult } from '../types';

interface MonitoringState {
  websites: Website[];
  incidents: Incident[];
  addWebsite: (name: string, url: string) => void;
  removeWebsite: (id: string) => void;
  updateWebsiteStatus: (id: string, result: CheckResult) => void;
  clearIncidents: () => void;
}

const MAX_HISTORY = 100;

export const useMonitoringStore = create<MonitoringState>()(
  persist(
    (set) => ({
      websites: [],
      incidents: [],
      addWebsite: (name, url) =>
        set((state) => ({
          websites: [
            ...state.websites,
            {
              id: crypto.randomUUID(),
              name,
              url,
              status: 'checking',
              lastChecked: null,
              history: [],
            },
          ],
        })),
      removeWebsite: (id) =>
        set((state) => ({
          websites: state.websites.filter((w) => w.id !== id),
          incidents: state.incidents.filter((i) => i.websiteId !== id),
        })),
      updateWebsiteStatus: (id, result) =>
        set((state) => {
          const website = state.websites.find((w) => w.id === id);
          if (!website) return state;

          const previousStatus = website.status;
          const newStatus = result.status;
          const hasStatusChanged = previousStatus !== newStatus && previousStatus !== 'checking';

          const newHistory = [...website.history, result].slice(-MAX_HISTORY);

          const updatedWebsite: Website = {
            ...website,
            status: newStatus,
            lastChecked: result.timestamp,
            history: newHistory,
          };

          const updatedWebsites = state.websites.map((w) => (w.id === id ? updatedWebsite : w));

          let updatedIncidents = state.incidents;
          if (hasStatusChanged) {
            const newIncident: Incident = {
              id: crypto.randomUUID(),
              websiteId: website.id,
              websiteName: website.name,
              timestamp: result.timestamp,
              previousStatus,
              newStatus,
              responseTime: result.responseTime,
            };
            updatedIncidents = [newIncident, ...state.incidents];
          }

          return {
            websites: updatedWebsites,
            incidents: updatedIncidents,
          };
        }),
      clearIncidents: () => set({ incidents: [] }),
    }),
    {
      name: 'uptime-sentinel-storage',
    }
  )
);
