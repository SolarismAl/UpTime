import { create } from 'zustand';
import { Website, Incident, AppState } from '../types';
import { collection, doc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MonitoringState {
  websites: Website[];
  incidents: Incident[];
  webhookUrl: string;
  isFirebaseConnected: boolean;
  initializeListeners: () => void;
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
    isFirebaseConnected: false,
    initializeListeners: () => {
      if (!db || get().isFirebaseConnected) return;
      
      set({ isFirebaseConnected: true });

      // Listen to websites
      onSnapshot(collection(db, 'websites'), (snapshot) => {
        const websites = snapshot.docs.map(doc => doc.data() as Website);
        set({ websites });
      });

      // Listen to incidents (last 100)
      const incidentsQuery = query(collection(db, 'incidents'), orderBy('timestamp', 'desc'), limit(100));
      onSnapshot(incidentsQuery, (snapshot) => {
        const incidents = snapshot.docs.map(doc => doc.data() as Incident);
        set({ incidents });
      });

      // Listen to settings
      onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
        if (docSnap.exists()) {
          set({ webhookUrl: docSnap.data().webhookUrl || '' });
        }
      });
    },
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
