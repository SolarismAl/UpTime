import { create } from 'zustand';
import { Website, Incident, AppState } from '../types';
import { io, Socket } from 'socket.io-client';

interface MonitoringState {
  websites: Website[];
  incidents: Incident[];
  webhookUrl: string;
  socket: Socket | null;
  connectSocket: () => void;
  syncState: (state: AppState) => void;
  addWebsite: (name: string, url: string, expectedStatus?: number, timeout?: number, keyword?: string, alertDelayMs?: number) => Promise<void>;
  removeWebsite: (id: string) => Promise<void>;
  setWebhookUrl: (url: string) => Promise<void>;
  clearIncidents: () => void; // Keeping for compatibility with UI
}

export const useMonitoringStore = create<MonitoringState>()(
  (set, get) => ({
    websites: [],
    incidents: [],
    webhookUrl: '',
    socket: null,
    connectSocket: () => {
      if (get().socket) return;
      const socket = io();
      socket.on('state_sync', (state: AppState) => {
        get().syncState(state);
      });
      set({ socket });
    },
    syncState: (state) => set({
      websites: state.websites || [],
      incidents: state.incidents || [],
      webhookUrl: state.webhookUrl || '',
    }),
    addWebsite: async (name, url, expectedStatus, timeout, keyword, alertDelayMs) => {
      await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, expectedStatus, timeout, keyword, alertDelayMs })
      });
    },
    removeWebsite: async (id) => {
      await fetch(`/api/websites?id=${id}`, { method: 'DELETE' });
    },
    setWebhookUrl: async (url) => {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: url })
      });
    },
    clearIncidents: () => set({ incidents: [] }), // We should ideally add a backend route for this, but local clear is fine for MVP
  })
);
